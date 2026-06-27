import trim from 'lodash/trim';
import {
  type Account as AccountEntity,
  applicationSchema,
  instanceSchema,
  PlApiClient,
  tokenSchema,
  type CreateAccountParams,
  type CredentialAccount,
  type CredentialApplication,
  type Token,
  type UpdateCredentialsParams,
} from 'pl-api';
import { defineMessages } from 'react-intl';
import * as v from 'valibot';
import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

import { createApp } from '@/actions/apps';
import { obtainOAuthToken, revokeOAuthToken } from '@/actions/oauth';
import { FE_NAME } from '@/actions/settings';
import * as BuildConfig from '@/build-config';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { scopedQueryKey } from '@/queries/query';
import { coerceObject } from '@/schemas/utils';
import { setSentryAccount, unsetSentryAccount } from '@/sentry';
import KVStore from '@/storage/kv-store';
import { useInstanceStore } from '@/stores/instance';
import { useSettingsStore } from '@/stores/settings';
import toast from '@/toast';
import { validId, parseBaseURL } from '@/utils/auth';
import sourceCode from '@/utils/code';
import { normalizeUsername } from '@/utils/input';
import { getScopes } from '@/utils/scopes';
import { isStandalone } from '@/utils/state';

import type { NicoliumResponse } from '@/api';

const messages = defineMessages({
  loggedOut: { id: 'auth.logged_out', defaultMessage: 'Logged out.' },
  accountDisabled: {
    id: 'auth.account_disabled',
    defaultMessage: 'Your account is currently disabled',
  },
  awaitingApproval: {
    id: 'auth.awaiting_approval',
    defaultMessage: 'Your account is awaiting approval',
  },
  missingConfirmedEmail: {
    id: 'auth.missing_confirmed_email',
    defaultMessage: 'You need to confirm your e-mail address',
  },
  passwordResetRequired: {
    id: 'auth.password_reset_required',
    defaultMessage: 'You need to reset your password',
  },
  invalidCredentials: {
    id: 'auth.invalid_credentials',
    defaultMessage: 'Wrong username or password',
  },
});

const instance = (() => {
  try {
    const el = document.getElementById('initial-results');
    if (!el?.textContent) return undefined;
    const raw = JSON.parse(el.textContent) as Record<string, string>;
    const decoded: Record<string, any> = {};
    for (const [key, base64string] of Object.entries(raw)) {
      const bytes = Uint8Array.from(
        atob(base64string)
          .split('')
          .map((c) => c.charCodeAt(0)),
      );
      decoded[key] = JSON.parse(new TextDecoder().decode(bytes));
    }
    const preloadedInstance = decoded['/api/v1/instance'];
    const parsedInstance = v.safeParse(instanceSchema, preloadedInstance);
    return parsedInstance.success ? parsedInstance.output : undefined;
  } catch {
    return undefined;
  }
})();

const backendUrl = URL.canParse(BuildConfig.BACKEND_URL) ? BuildConfig.BACKEND_URL : '';

const mastodonPreloadSchema = coerceObject({
  meta: coerceObject({
    access_token: v.string(),
    me: v.string(),
  }),
  accounts: v.record(
    v.string(),
    v.object({
      url: v.string(),
    }),
  ),
});

const authUserSchema = v.object({
  access_token: v.string(),
  id: v.string(),
  url: v.string(),
  iceshrimp_access_token: v.fallback(v.optional(v.string()), undefined),
});

const tokenWithAppSchema = v.object({
  ...tokenSchema.entries,
  client_id: v.fallback(v.optional(v.string()), undefined),
  client_secret: v.fallback(v.optional(v.string()), undefined),
});

type TokenWithApp = v.InferOutput<typeof tokenWithAppSchema>;

type AuthUser = v.InferOutput<typeof authUserSchema>;

type Me = string | null | false;

const buildKey = (parts: string[]) => parts.join(':');

const NAMESPACE = trim(BuildConfig.FE_SUBDIRECTORY, '/')
  ? `nicolium@${BuildConfig.FE_SUBDIRECTORY}`
  : 'nicolium';

const STORAGE_KEY = buildKey([NAMESPACE, 'auth']);

interface AuthData {
  app: CredentialApplication | null;
  tokens: Record<string, TokenWithApp>;
  users: Record<string, AuthUser>;
  /** current user URL or id */
  me: string | null;
}

interface AuthState extends AuthData {
  /** keyed by account URL */
  clients: Record<string, PlApiClient>;
  defaultClient: PlApiClient;
  /** string = logged in, null = loading, false = not logged in */
  currentAccountId: Me;
}

interface AuthActions {
  setApp: (app: CredentialApplication) => void;
  setAppToken: (token: Token) => void;
  addToken: (token: Token, app?: CredentialApplication) => void;
  removeAccount: (account: Pick<AccountEntity, 'url'>, standalone?: boolean) => void;
  addCredentials: (token: string, account: CredentialAccount) => void;
  skipCredentials: () => void;
  onCredentialsFailed: (error: { response: NicoliumResponse }) => void;
  onTokenFailed: (token: string, error: { response: NicoliumResponse }) => void;
  switchAccount: (account: AccountEntity) => void;
  setCurrentAccount: (account: CredentialAccount) => void;
  setCurrentAccountIfUnset: (account: CredentialAccount) => void;
  loadMastodonPreload: (data: Record<string, any>) => void;

  logIn: (username: string, password: string) => Promise<Token>;
  verifyOtp: (code: string, mfa_token: string) => Promise<Token>;
  verifyCredentials: (token: string, accountUrl?: string) => Promise<CredentialAccount>;
  fetchMe: () => Promise<CredentialAccount | undefined>;
  logOut: () => Promise<void>;
  switchAccountById: (accountId: string) => void;
  register: (params: CreateAccountParams) => Promise<Token | undefined>;
  fetchCaptcha: () => ReturnType<PlApiClient['oauth']['getCaptcha']>;
  updateMe: (params: UpdateCredentialsParams) => Promise<CredentialAccount>;
  verifyAccounts: () => void;
  setIceshrimpToken: (accountUrl: string, token: string) => void;
}

const validUser = (user?: AuthUser) => {
  try {
    return !!(user && validId(user.id) && validId(user.access_token));
  } catch {
    return false;
  }
};

const firstValidUser = (state: AuthData) => Object.values(state.users).find(validUser);

const getUrlOrId = (user?: AuthUser): string | null => {
  try {
    if (!user) return null;
    return user.url || user.id;
  } catch {
    return null;
  }
};

const maybeShiftMe = (state: AuthData) => {
  const user = state.users[state.me!];
  if (validUser(user)) return;
  const nextUser = firstValidUser(state);
  state.me = getUrlOrId(nextUser);
};

const setSessionUser = (state: AuthData) => {
  const user = state.users[state.me!];
  state.me = getUrlOrId(validUser(user) ? user : undefined);
};

const isUpgradingUrlId = (state: AuthData) => {
  const me = state.me;
  const user = state.users[me!];
  return validId(me) && user && !URL.canParse(me as string);
};

const sanitizeState = (state: AuthData) => {
  if (isUpgradingUrlId(state)) return;
  state.users = Object.fromEntries(
    Object.entries(state.users).filter(([url, user]) => validUser(user) && user.url === url),
  );
  state.tokens = Object.fromEntries(
    Object.entries(state.tokens).filter(([id, token]) => validId(id) && token.access_token === id),
  );
};

const persistAuth = (state: AuthData) => {
  const { actions: _, clients: __, defaultClient: ___, ...rest } = state as AuthStore;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
};

const getLocalState = (): (AuthData & { clients: Record<string, PlApiClient> }) | undefined => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return undefined;
  const state = JSON.parse(raw);
  if (!state) return undefined;

  const parsedUsers = Object.fromEntries(
    Object.entries(state.users).map(([key, value]) => [key, v.parse(authUserSchema, value)]),
  ) as Record<string, AuthUser>;

  const clients: Record<string, PlApiClient> = {};
  for (const [url, user] of Object.entries(parsedUsers)) {
    clients[url] = new PlApiClient(parseBaseURL(url) || backendUrl, user.access_token, {
      instance,
      iceshrimpAccessToken: user.iceshrimp_access_token,
      onFetchIceshrimpAccessToken: (token: string) => {
        useAuthStore.getState().actions.setIceshrimpToken(url, token);
      },
    });
  }

  return {
    app: state.app && v.parse(applicationSchema, state.app),
    tokens: Object.fromEntries(
      Object.entries(state.tokens).map(([key, value]) => [key, v.parse(tokenWithAppSchema, value)]),
    ),
    users: parsedUsers,
    me: state.me,
    clients,
  };
};

const localState = getLocalState();

const initializeAuthData = (data: AuthData): AuthData => {
  maybeShiftMe(data);
  setSessionUser(data);
  sanitizeState(data);
  persistAuth(data);
  return data;
};

const initialAuthData: AuthData = initializeAuthData({
  app: null,
  tokens: {},
  users: {},
  me: null,
  ...localState,
});

const defaultClient = new PlApiClient(backendUrl, undefined, { instance });

const importTokenData = (state: AuthData, token: Token, app?: CredentialApplication) => {
  state.tokens[token.access_token] = {
    client_id: app?.client_id,
    client_secret: app?.client_secret,
    ...token,
  };
};

const upgradeNonUrlId = (state: AuthData, account: CredentialAccount) => {
  if (state.me && URL.canParse(state.me)) return;
  state.me = state.me === account.id ? account.url : state.me;
  delete state.users[account.id];
};

const userMismatch =
  (token: string, account: CredentialAccount) => (user: AuthUser, url: string) => {
    const sameToken = user.access_token === token;
    const differentUrl = url !== account.url || user.url !== account.url;
    const differentId = user.id !== account.id;
    return sameToken && (differentUrl || differentId);
  };

const importCredentialsData = (state: AuthData, token: string, account: CredentialAccount) => {
  state.users[account.url] = v.parse(authUserSchema, {
    id: account.id,
    access_token: token,
    url: account.url,
  });
  state.tokens[token].me = account.url;
  state.users = Object.fromEntries(
    Object.entries(state.users).filter(([url, user]) => !userMismatch(token, account)(user, url)),
  );
  state.me = state.me ?? account.url;
  upgradeNonUrlId(state, account);
};

const deleteToken = (state: AuthData, token: string) => {
  delete state.tokens[token];
  state.users = Object.fromEntries(
    Object.entries(state.users).filter(([_, user]) => user.access_token !== token),
  );
  maybeShiftMe(state);
};

const deleteUser = (state: AuthData, account: Pick<AccountEntity, 'url'>) => {
  delete state.users[account.url];
  state.tokens = Object.fromEntries(
    Object.entries(state.tokens).filter(([_, token]) => token.me !== account.url),
  );
  maybeShiftMe(state);
};

const importMastodonPreloadData = (state: AuthData, data: Record<string, any>) => {
  const parsedData = v.parse(mastodonPreloadSchema, data);
  const accountId = parsedData.meta.me;
  const accountUrl = parsedData.accounts[accountId]?.url;
  const accessToken = parsedData.meta.access_token;

  if (validId(accessToken) && validId(accountId) && URL.canParse(accountUrl)) {
    state.tokens[accessToken] = v.parse(tokenSchema, {
      access_token: accessToken,
      account: accountId,
      me: accountUrl,
      scope: 'read write follow push',
      token_type: 'Bearer',
    });

    state.users[accountUrl] = v.parse(authUserSchema, {
      id: accountId,
      access_token: accessToken,
      url: accountUrl,
    });
  }
  maybeShiftMe(state);
};

const persistAuthAccount = (account: CredentialAccount, params?: Record<string, any>) => {
  if (!account?.url) return;
  const key = `authAccount:${account.url}`;
  KVStore.getItem(key)
    .then((oldAccount: any) => {
      const settings = oldAccount?.settings_store ?? {};
      account.settings_store ??= settings;
      if (params?.pleroma_settings_store) {
        account.settings_store = { ...account.settings_store, ...params.pleroma_settings_store };
      }
      KVStore.setItem(key, account);
    })
    .catch(console.error);
};

const deleteForbiddenToken = (
  state: AuthData,
  error: { response: NicoliumResponse },
  token: string,
) => {
  if (error.response && [401, 403].includes(error.response.status)) {
    deleteToken(state, token);
  }
};

const reload = () => {
  location.replace('/');
};

const userSwitched = (
  oldMe: string | null,
  newMe: string | null,
  users: Record<string, AuthUser>,
) => {
  const stillValid = typeof oldMe === 'string' && typeof newMe === 'string';
  const didChange = oldMe !== newMe;
  const userUpgradedUrl = users[newMe!]?.id === oldMe;
  return stillValid && didChange && !userUpgradedUrl;
};

const handleForbiddenMe = (currentAccountId: Me, error: { response: NicoliumResponse }): Me => {
  if (error.response?.status && [401, 403].includes(error.response.status)) {
    return false;
  }
  return currentAccountId;
};

/** Look up an account in the React Query cache. */
const selectAccount = (accountId: string, scopeUrl: string) =>
  queryClient.getQueryData(scopedQueryKey(queryKeys.accounts.show(accountId), scopeUrl));

type AuthStore = AuthState & { actions: AuthActions };

const useAuthStore = create<AuthStore>()(
  mutative((set, get) => {
    const getMeClient = () => {
      const { me, clients } = get();
      return me ? (clients[me] ?? get().defaultClient) : get().defaultClient;
    };

    const getMeUrl = () => {
      const state = get();
      const accountId = state.currentAccountId;
      if (typeof accountId === 'string') {
        return selectAccount(accountId, state.me || backendUrl)?.url ?? state.me;
      }
      return state.me;
    };

    const getMeToken = () => {
      const state = get();
      const accountUrl = getMeUrl() ?? state.me;
      return state.users[accountUrl!]?.access_token;
    };

    const createClientForAccount = (
      accountUrl: string,
      token: string,
      iceshrimpAccessToken?: string,
    ) => {
      const client = new PlApiClient(parseBaseURL(accountUrl) || backendUrl, token, {
        iceshrimpAccessToken,
        onFetchIceshrimpAccessToken: (token: string) => {
          get().actions.setIceshrimpToken(accountUrl, token);
        },
      });
      set({ clients: { ...get().clients, [accountUrl]: client } });
      return client;
    };

    const removeClientForAccount = (accountUrl: string) => {
      const { [accountUrl]: _, ...rest } = get().clients;
      set({ clients: rest });
    };

    const authLoggedIn = (token: Token, app?: CredentialApplication | null) => {
      get().actions.addToken(token, app ?? undefined);
      return token;
    };

    const createAuthApp = async () => {
      const params = {
        client_name: `${sourceCode.displayName} (${new URL(window.origin).host})`,
        redirect_uris: 'urn:ietf:wg:oauth:2.0:oob',
        scopes: getScopes(),
        website: sourceCode.homepage,
      };
      const app = await createApp(params);
      get().actions.setApp(app);
      return app;
    };

    const createAppToken = async () => {
      const { app } = get();
      const params = {
        client_id: app?.client_id!,
        client_secret: app?.client_secret!,
        redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
        grant_type: 'client_credentials',
        scope: getScopes(),
      };
      const token = await obtainOAuthToken(params);
      get().actions.setAppToken(token);
      return token;
    };

    const fetchMeSuccess = async (account: CredentialAccount) => {
      const client = getMeClient();
      let settingsFound = false;

      setSentryAccount(account);

      const settings = account.settings_store?.[FE_NAME];

      if (settings) {
        useSettingsStore.getState().actions.loadUserSettings(settings);
        settingsFound = true;
      }

      if (!client.features.frontendConfigurations && client.features.notes) {
        const note = await client.accounts
          .getRelationships([account.id])
          .then((relationships) => relationships[0]?.note);

        if (note) {
          const match = note.match(/<nicolium-config>(.*)<\/nicolium-config>/);
          if (match) {
            try {
              const frontendConfig = JSON.parse(decodeURIComponent(match[1]));
              if (typeof frontendConfig === 'object' && frontendConfig !== null) {
                frontendConfig.storeSettingsInNotes = true;
              }
              useSettingsStore.getState().actions.loadUserSettings(frontendConfig);
              settingsFound = true;
              get().actions.setCurrentAccount(account);
              return frontendConfig;
            } catch (error) {
              console.error('Failed to parse frontend config from account note', error);
            }
          }
        }
      }

      if (!settingsFound) {
        useSettingsStore.getState().actions.loadUserSettings(undefined);
      }

      get().actions.setCurrentAccount(account);
    };

    return {
      ...initialAuthData,
      clients: localState?.clients ?? {},
      defaultClient,
      currentAccountId: null,

      actions: {
        setApp: (app) => {
          set((state) => {
            state.app = app;
          });
          persistAuth(get());
        },
        setAppToken: (token) => {
          set((state) => {
            if (state.app) state.app = { ...state.app, ...token } as CredentialApplication;
          });
          persistAuth(get());
        },
        addToken: (token, app) => {
          set((state) => {
            importTokenData(state, token, app);
          });
          persistAuth(get());
        },
        removeAccount: (account, standalone) => {
          const oldMe = get().me;
          set((state) => {
            deleteUser(state, account);
            state.currentAccountId = false;
          });
          removeClientForAccount(account.url);
          persistAuth(get());

          if (BuildConfig.NODE_ENV === 'production') {
            location.href = '/login';
          }

          const newMe = get().me;
          if (standalone || userSwitched(oldMe, newMe, get().users)) {
            reload();
          }
        },
        addCredentials: (token, account) => {
          const oldMe = get().me;

          set((state) => {
            importCredentialsData(state, token, account);
            state.currentAccountId = state.currentAccountId ?? account.id;
          });

          persistAuthAccount(account);
          createClientForAccount(
            account.url,
            token,
            get().users[account.url]?.iceshrimp_access_token,
          );

          persistAuth(get());
          const newMe = get().me;
          if (userSwitched(oldMe, newMe, get().users)) {
            reload();
          }
        },
        skipCredentials: () => {
          const oldMe = get().me;
          set((state) => {
            state.me = null;
            state.currentAccountId = false;
          });
          persistAuth(get());
          const newMe = get().me;
          if (userSwitched(oldMe, newMe, get().users)) {
            reload();
          }
        },
        onCredentialsFailed: (error) => {
          set((state) => {
            state.currentAccountId = handleForbiddenMe(state.currentAccountId, error);
          });
        },
        onTokenFailed: (token, error) => {
          const oldMe = get().me;
          set((state) => {
            deleteForbiddenToken(state, error, token);
            if (state.currentAccountId === null) state.currentAccountId = false;
          });
          persistAuth(get());
          const newMe = get().me;
          if (userSwitched(oldMe, newMe, get().users)) {
            reload();
          }
        },
        switchAccount: (account) => {
          const oldMe = get().me;

          set((state) => {
            state.me = account.url;
            state.currentAccountId = account.id;
          });

          // Ensure we have a client for the account
          const user = get().users[account.url];
          const accessToken = user?.access_token;
          if (accessToken && !get().clients[account.url]) {
            createClientForAccount(account.url, accessToken, user?.iceshrimp_access_token);
          }

          persistAuth(get());
          const newMe = get().me;
          if (userSwitched(oldMe, newMe, get().users)) {
            reload();
          }
        },
        setCurrentAccount: (account) => {
          set((state) => {
            state.currentAccountId = account.id;
          });
        },
        setCurrentAccountIfUnset: (account) => {
          set((state) => {
            state.currentAccountId = state.currentAccountId ?? account.id;
          });
        },
        loadMastodonPreload: (data) => {
          const oldMe = get().me;
          set((state) => {
            importMastodonPreloadData(state, data);
          });
          for (const [url, user] of Object.entries(get().users)) {
            if (!get().clients[url]) {
              createClientForAccount(url, user.access_token, user.iceshrimp_access_token);
            }
          }
          persistAuth(get());
          const newMe = get().me;
          if (userSwitched(oldMe, newMe, get().users)) {
            reload();
          }
        },

        logIn: async (username, password) => {
          try {
            await createAuthApp();

            const { app } = get();
            const params = {
              client_id: app?.client_id!,
              client_secret: app?.client_secret!,
              redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
              grant_type: 'password',
              username: normalizeUsername(username),
              password,
              scope: getScopes(),
            };

            const token = await obtainOAuthToken(params, undefined, get().defaultClient);
            authLoggedIn(token, app);
            return token;
          } catch (error: any) {
            if (error.response?.json?.error === 'mfa_required') {
              throw error;
            } else if (error.response?.json?.identifier) {
              switch (error.response.json.identifier) {
                case 'account_is_disabled':
                  toast.error(messages.accountDisabled);
                  break;
                case 'password_reset_required':
                  toast.error(messages.passwordResetRequired);
                  break;
                case 'missing_confirmed_email':
                  toast.error(messages.missingConfirmedEmail);
                  break;
                case 'awaiting_approval':
                  toast.error(messages.awaitingApproval);
                  break;
                default:
                  toast.error(messages.invalidCredentials);
                  break;
              }
            } else {
              toast.error(messages.invalidCredentials);
            }
            throw error;
          }
        },

        verifyOtp: async (code, mfaToken) => {
          const { app, defaultClient: client } = get();

          const token = await client.oauth.mfaChallenge({
            client_id: app?.client_id!,
            client_secret: app?.client_secret!,
            mfa_token: mfaToken,
            code,
            challenge_type: 'totp',
            scope: getScopes(),
          });

          authLoggedIn(token, app);
          return token;
        },

        verifyCredentials: async (token, accountUrl) => {
          const baseURL = parseBaseURL(accountUrl) || BuildConfig.BACKEND_URL;
          const client = new PlApiClient(baseURL, token);

          const instanceData = await client.instance.getInstance();

          try {
            const account = await client.settings.verifyCredentials();
            useInstanceStore.getState().actions.loadInstance(instanceData, account.url);
            queryClient.setQueryData(
              scopedQueryKey(queryKeys.accounts.show(account.id), account.url),
              account,
            );
            queryClient.setQueryData(
              scopedQueryKey(queryKeys.accountCredentials.show(account.id), account.url),
              account,
            );
            get().actions.addCredentials(token, account);
            if (account.id === get().currentAccountId) fetchMeSuccess(account);
            return account;
          } catch (error: any) {
            if (get().currentAccountId === null) get().actions.onCredentialsFailed(error);
            get().actions.onTokenFailed(token, error);
            throw error;
          }
        },

        fetchMe: async () => {
          const token = getMeToken();
          const accountUrl = getMeUrl();

          if (!token) {
            get().actions.skipCredentials();
            return;
          }

          try {
            // Try to remember the account from KVStore first
            try {
              const account = await KVStore.getItemOrError(`authAccount:${accountUrl}`);
              queryClient.setQueryData(
                scopedQueryKey(queryKeys.accounts.show(account.id), account.url),
                account,
              );
              queryClient.setQueryData(
                scopedQueryKey(queryKeys.accountCredentials.show(account.id), account.url),
                account,
              );
              get().actions.setCurrentAccountIfUnset(account);
              if (account.id === get().currentAccountId) fetchMeSuccess(account);
            } catch {}

            return await get().actions.verifyCredentials(token, accountUrl!);
          } catch (error: any) {
            get().actions.onCredentialsFailed(error);
          }
        },

        logOut: async () => {
          const state = get();
          const accountId = state.currentAccountId;
          const account =
            typeof accountId === 'string'
              ? selectAccount(accountId, state.me || backendUrl)
              : undefined;
          const standalone = isStandalone();

          if (!account) return;

          const token = state.users[account.url]?.access_token;
          const params = {
            client_id: state.tokens[token]?.client_id ?? state.app?.client_id!,
            client_secret: state.tokens[token]?.client_secret ?? state.app?.client_secret!,
            token,
          };

          try {
            await revokeOAuthToken(params);
          } finally {
            queryClient.invalidateQueries();
            queryClient.clear();
            unsetSentryAccount();
            get().actions.removeAccount(account, standalone);
            toast.success(messages.loggedOut);
          }
        },

        switchAccountById: (accountId) => {
          const account = selectAccount(accountId, get().me || backendUrl);
          if (!account) return;

          const { currentAccountId } = get();
          if (typeof currentAccountId === 'string' && currentAccountId !== account.id) {
            queryClient.invalidateQueries();
            queryClient.clear();
          }

          get().actions.switchAccount(account);
        },

        register: async (params) => {
          params.fullname = params.username;

          const app = await createAuthApp();
          await createAppToken();

          const client = getMeClient();
          const response = await client.settings.createAccount(params);
          if ('identifier' in response) {
            toast.info(response.message);
          } else {
            authLoggedIn(response, app);
            return response;
          }
        },

        fetchCaptcha: () => getMeClient().oauth.getCaptcha(),

        updateMe: async (params) => {
          const client = getMeClient();
          const response = await client.settings.updateCredentials(params);
          persistAuthAccount(response, params);

          queryClient.setQueryData(
            scopedQueryKey(queryKeys.accounts.show(response.id), response.url),
            response,
          );
          get().actions.setCurrentAccount(response);

          return response;
        },

        verifyAccounts: () => {
          const { users } = get();
          Object.values(users).forEach((user) => {
            const account = selectAccount(user.id, user.url);
            if (!account) {
              get()
                .actions.verifyCredentials(user.access_token, user.url)
                .catch(() => {
                  console.warn(`Failed to load account: ${user.url}`);
                });
            }
          });
        },

        setIceshrimpToken: (accountUrl, token) => {
          set((state) => {
            const user = state.users[accountUrl];
            if (user) {
              user.iceshrimp_access_token = token;
            }
          });
          persistAuth(get());
        },
      },
    };
  }),
);

const useMe = () => useAuthStore((state) => state.currentAccountId);

const useAuthActions = () => useAuthStore((state) => state.actions);

const getCurrentAccountId = () => useAuthStore.getState().currentAccountId;

const getMe = () => useAuthStore.getState().me;

const getClient = () => {
  const { me, clients, defaultClient } = useAuthStore.getState();
  return me ? (clients[me] ?? defaultClient) : defaultClient;
};

const getOwnAccount = () => {
  const accountId = getCurrentAccountId();
  if (typeof accountId === 'string')
    return selectAccount(accountId, useAuthStore.getState().me || backendUrl);
};

const getApp = () => useAuthStore.getState().app;

const isLoggedIn = () => validId(getCurrentAccountId());

const getAuthUserUrl = () => {
  const { me, users } = useAuthStore.getState();
  return [users[me!]?.url, me]
    .filter((url): url is string => !!url)
    .find((url) => URL.canParse(url));
};

const getMeUrl = () => getOwnAccount()?.url;

const getScopeUrl = () => useAuthStore.getState().me || backendUrl;

const verifyCredentials = (token: string, accountUrl?: string) =>
  useAuthStore.getState().actions.verifyCredentials(token, accountUrl);

const switchAccount = (accountId: string) =>
  useAuthStore.getState().actions.switchAccountById(accountId);

const updateMe = (params: UpdateCredentialsParams) =>
  useAuthStore.getState().actions.updateMe(params);

const addToken = (token: Token, app?: CredentialApplication | null) =>
  useAuthStore.getState().actions.addToken(token, app ?? undefined);

const loadMastodonPreload = (data: Record<string, any>) =>
  useAuthStore.getState().actions.loadMastodonPreload(data);

const removeAccount = (account: Pick<AccountEntity, 'url'>) =>
  useAuthStore.getState().actions.removeAccount(account);

export {
  messages,
  useAuthStore,
  useAuthActions,
  useMe,
  getCurrentAccountId,
  getMe,
  getClient,
  getOwnAccount,
  getApp,
  isLoggedIn,
  getAuthUserUrl,
  getMeUrl,
  getScopeUrl,
  verifyCredentials,
  switchAccount,
  updateMe,
  addToken,
  loadMastodonPreload,
  removeAccount,
  defaultClient,
  backendUrl,
  type Me,
};
