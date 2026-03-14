import trim from 'lodash/trim';
import {
  type Account as AccountEntity,
  applicationSchema,
  instanceSchema,
  PlApiClient,
  tokenSchema,
  type CredentialAccount,
  type CredentialApplication,
  type Token,
} from 'pl-api';
import * as v from 'valibot';
import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

import * as BuildConfig from '@/build-config';
import { coerceObject } from '@/schemas/utils';
import KVStore from '@/storage/kv-store';
import { validId, isURL, parseBaseURL } from '@/utils/auth';

import type { NicoliumResponse } from '@/api';

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

const backendUrl = isURL(BuildConfig.BACKEND_URL) ? BuildConfig.BACKEND_URL : '';

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
});

const tokenWithAppSchema = v.object({
  ...tokenSchema.entries,
  client_id: v.fallback(v.optional(v.string()), undefined),
  client_secret: v.fallback(v.optional(v.string()), undefined),
});

type TokenWithApp = v.InferOutput<typeof tokenWithAppSchema>;

interface AuthUser {
  access_token: string;
  id: string;
  url: string;
}

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
  // current user URL or id
  me: string | null;
}

interface AuthState extends AuthData {
  client: InstanceType<typeof PlApiClient>;
  // string = logged in, null = loading, false = not logged in
  currentAccountId: Me;
}

interface AuthActions {
  setApp: (app: CredentialApplication) => void;
  setAppToken: (token: Token) => void;
  importToken: (token: Token, app?: CredentialApplication) => void;
  removeToken: (account: AccountEntity, standalone?: boolean) => void;
  importCredentials: (token: string, account: CredentialAccount) => void;
  importCredentialsSkip: () => void;
  importCredentialsFailed: (error: { response: NicoliumResponse }) => void;
  removeFailedToken: (token: string, error: { response: NicoliumResponse }) => void;
  switchAccount: (account: AccountEntity) => void;
  setCurrentAccount: (account: CredentialAccount) => void;
  setCurrentAccountIfUnset: (account: CredentialAccount) => void;
  importMastodonPreload: (data: Record<string, any>) => void;
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
  return validId(me) && user && !isURL(me);
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const getLocalState = (): (AuthData & { client: InstanceType<typeof PlApiClient> }) | undefined => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return undefined;
  const state = JSON.parse(raw);
  if (!state) return undefined;
  return {
    app: state.app && v.parse(applicationSchema, state.app),
    tokens: Object.fromEntries(
      Object.entries(state.tokens).map(([key, value]) => [key, v.parse(tokenWithAppSchema, value)]),
    ),
    users: Object.fromEntries(
      Object.entries(state.users).map(([key, value]) => [key, v.parse(authUserSchema, value)]),
    ),
    me: state.me,
    client: new PlApiClient(
      parseBaseURL(state.me) || backendUrl,
      state.users[state.me]?.access_token,
      { instance },
    ),
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

const importToken = (state: AuthData, token: Token, app?: CredentialApplication) => {
  state.tokens[token.access_token] = {
    client_id: app?.client_id,
    client_secret: app?.client_secret,
    ...token,
  };
};

const upgradeNonUrlId = (state: AuthData, account: CredentialAccount) => {
  if (isURL(state.me)) return;
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

const importCredentials = (state: AuthData, token: string, account: CredentialAccount) => {
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

  if (validId(accessToken) && validId(accountId) && isURL(accountUrl)) {
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

const persistAuthAccount = (account: CredentialAccount) => {
  const key = `authAccount:${account.url}`;
  KVStore.getItem(key)
    .then((oldAccount: any) => {
      const settings = oldAccount?.settings_store ?? {};
      account.settings_store ??= settings;
      KVStore.setItem(key, account);
    })
    .catch(console.error);
  return account;
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

type AuthStore = AuthState & { actions: AuthActions };

const useAuthStore = create<AuthStore>()(
  mutative((set, get) => ({
    ...initialAuthData,
    client: localState?.client ?? new PlApiClient(backendUrl, undefined, { instance }),
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
      importToken: (token, app) => {
        set((state) => {
          importToken(state, token, app);
        });
        persistAuth(get());
      },
      removeToken: (account, standalone) => {
        const oldMe = get().me;
        set((state) => {
          deleteUser(state, account);
          state.currentAccountId = false;
        });
        persistAuth(get());

        if (BuildConfig.NODE_ENV === 'production') {
          location.href = '/login';
        }

        const newMe = get().me;
        if (standalone || userSwitched(oldMe, newMe, get().users)) {
          reload();
        }
      },
      importCredentials: (token, account) => {
        const oldMe = get().me;
        let newClient = get().client;

        set((state) => {
          importCredentials(state, token, persistAuthAccount(account));
          state.currentAccountId = state.currentAccountId ?? account.id;
        });

        const s = get();
        if (!oldMe) {
          if (s.client.baseURL === parseBaseURL(account.url)) {
            s.client.accessToken = token;
          } else {
            newClient = new PlApiClient(parseBaseURL(account.url) || backendUrl, token);
            set({ client: newClient });
          }
        }

        persistAuth(get());
        const newMe = get().me;
        if (userSwitched(oldMe, newMe, get().users)) {
          reload();
        }
      },
      importCredentialsSkip: () => {
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
      importCredentialsFailed: (error) => {
        set((state) => {
          state.currentAccountId = handleForbiddenMe(state.currentAccountId, error);
        });
      },
      removeFailedToken: (token, error) => {
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

        const s = get();
        const accessToken = s.users[account.url]?.access_token;
        if (s.client.baseURL === parseBaseURL(account.url)) {
          s.client.accessToken = accessToken;
        } else {
          set({
            client: new PlApiClient(parseBaseURL(account.url) || backendUrl, accessToken),
          });
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
      importMastodonPreload: (data) => {
        const oldMe = get().me;
        set((state) => {
          importMastodonPreloadData(state, data);
        });
        persistAuth(get());
        const newMe = get().me;
        if (userSwitched(oldMe, newMe, get().users)) {
          reload();
        }
      },
    },
  })),
);

const useMe = () => useAuthStore((state) => state.currentAccountId);

const useAuthActions = () => useAuthStore((state) => state.actions);

export { useAuthStore, useAuthActions, useMe, type Me, type AuthUser, type TokenWithApp };
