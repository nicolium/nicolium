/**
 * Auth: login & registration workflow.
 * @module @/actions/auth
 */
import {
  PlApiClient,
  type CreateAccountParams,
  type CredentialAccount,
  type CredentialApplication,
  type Token,
  type UpdateCredentialsParams,
} from 'pl-api';
import { defineMessages } from 'react-intl';

import { createAccount } from '@/actions/accounts';
import { createApp } from '@/actions/apps';
import { obtainOAuthToken, revokeOAuthToken } from '@/actions/oauth';
import * as BuildConfig from '@/build-config';
import { selectAccount, selectOwnAccount } from '@/queries/accounts/selectors';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { setSentryAccount, unsetSentryAccount } from '@/sentry';
import KVStore from '@/storage/kv-store';
import { useAuthStore } from '@/stores/auth';
import { useComposeStore } from '@/stores/compose';
import { useSettingsStore } from '@/stores/settings';
import toast from '@/toast';
import { parseBaseURL } from '@/utils/auth';
import sourceCode from '@/utils/code';
import { normalizeUsername } from '@/utils/input';
import { getScopes } from '@/utils/scopes';
import { isStandalone } from '@/utils/state';

const messages = defineMessages({
  loggedOut: { id: 'auth.logged_out', defaultMessage: 'Logged out.' },
  awaitingApproval: {
    id: 'auth.awaiting_approval',
    defaultMessage: 'Your account is awaiting approval',
  },
  invalidCredentials: {
    id: 'auth.invalid_credentials',
    defaultMessage: 'Wrong username or password',
  },
});

const getAuth = () => useAuthStore.getState();
const getActions = () => getAuth().actions;

const createAuthApp = async () => {
  const params = {
    client_name: `${sourceCode.displayName} (${new URL(window.origin).host})`,
    redirect_uris: 'urn:ietf:wg:oauth:2.0:oob',
    scopes: getScopes(),
    website: sourceCode.homepage,
  };

  const app = await createApp(params);
  getActions().setApp(app);
  return app;
};

const createAppToken = async () => {
  const { app } = getAuth();

  const params = {
    client_id: app?.client_id!,
    client_secret: app?.client_secret!,
    redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
    grant_type: 'client_credentials',
    scope: getScopes(),
  };

  const token = await obtainOAuthToken(params);
  getActions().setAppToken(token);
  return token;
};

const createAppAndToken = async () => {
  const app = await createAuthApp();
  await createAppToken();
  return { app };
};

const createUserToken = async (username: string, password: string) => {
  const { app } = getAuth();

  const params = {
    client_id: app?.client_id!,
    client_secret: app?.client_secret!,
    redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
    grant_type: 'password',
    username,
    password,
    scope: getScopes(),
  };

  const token = await obtainOAuthToken(params);
  authLoggedIn(token, app);
  return token;
};

const otpVerify = async (code: string, mfa_token: string) => {
  const { app, me } = getAuth();
  const baseUrl = parseBaseURL(me || undefined) || BuildConfig.BACKEND_URL;
  const client = new PlApiClient(baseUrl);

  const token = await client.oauth.mfaChallenge({
    client_id: app?.client_id!,
    client_secret: app?.client_secret!,
    mfa_token,
    code,
    challenge_type: 'totp',
  });

  authLoggedIn(token, app);
  return token;
};

const verifyCredentials = async (token: string, accountUrl?: string) => {
  const baseURL = parseBaseURL(accountUrl) || BuildConfig.BACKEND_URL;
  const client = new PlApiClient(baseURL, token);

  await client.instance.getInstance();

  try {
    const account = await client.settings.verifyCredentials();
    queryClient.setQueryData(queryKeys.accounts.show(account.id), account);
    getActions().importCredentials(token, account);
    if (account.id === getAuth().currentAccountId) fetchMeSuccess(account);
    return account;
  } catch (error: any) {
    if (getAuth().currentAccountId === null) getActions().importCredentialsFailed(error);
    getActions().removeFailedToken(token, error);
    throw error;
  }
};

const rememberAuthAccount = async (accountUrl: string) => {
  const account = await KVStore.getItemOrError(`authAccount:${accountUrl}`);
  queryClient.setQueryData(queryKeys.accounts.show(account.id), account);
  getActions().setCurrentAccountIfUnset(account);
  if (account.id === getAuth().currentAccountId) fetchMeSuccess(account);
  return account;
};

const loadCredentials = async (token: string, accountUrl: string) => {
  try {
    await rememberAuthAccount(accountUrl);
  } finally {
    await verifyCredentials(token, accountUrl);
  }
};

const logIn = async (username: string, password: string) => {
  try {
    await createAuthApp();
    return await createUserToken(normalizeUsername(username), password);
  } catch (error: any) {
    if (error.response?.json?.error === 'mfa_required') {
      throw error;
    } else if (error.response?.json?.identifier === 'awaiting_approval') {
      toast.error(messages.awaitingApproval);
    } else {
      toast.error(messages.invalidCredentials);
    }
    throw error;
  }
};

const logOut = async () => {
  const state = getAuth();
  const account = selectOwnAccount();
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
    getActions().removeToken(account, standalone);
    toast.success(messages.loggedOut);
  }
};

const switchAccount = (accountId: string) => {
  const account = selectAccount(accountId);
  if (!account) return;

  const { currentAccountId } = getAuth();
  if (typeof currentAccountId === 'string' && currentAccountId !== account.id) {
    queryClient.invalidateQueries();
    queryClient.clear();
  }

  getActions().switchAccount(account);
};

const fetchOwnAccounts = () => {
  const { users } = getAuth();
  Object.values(users).forEach((user) => {
    const account = selectAccount(user.id);
    if (!account) {
      verifyCredentials(user.access_token, user.url).catch(() => {
        console.warn(`Failed to load account: ${user.url}`);
      });
    }
  });
};

const register = async (params: CreateAccountParams) => {
  params.fullname = params.username;

  const { app } = await createAppAndToken();

  const { response } = await createAccount(params);
  if ('identifier' in response) {
    toast.info(response.message);
  } else {
    authLoggedIn(response, app);
    return response;
  }
};

const fetchCaptcha = () => getAuth().client.oauth.getCaptcha();

const authLoggedIn = (token: Token, app?: CredentialApplication | null) => {
  getActions().importToken(token, app ?? undefined);
  return token;
};

const getMeUrl = () => {
  const state = getAuth();
  const accountId = state.currentAccountId;
  if (typeof accountId === 'string') {
    return selectAccount(accountId)?.url ?? state.me;
  }
  return state.me;
};

const getMeToken = () => {
  const state = getAuth();
  const accountUrl = getMeUrl() ?? state.me;
  return state.users[accountUrl!]?.access_token;
};

const fetchMe = async () => {
  const token = getMeToken();
  const accountUrl = getMeUrl();

  if (!token) {
    getActions().importCredentialsSkip();
    return;
  }

  try {
    return await loadCredentials(token, accountUrl!);
  } catch (error: any) {
    getActions().importCredentialsFailed(error);
  }
};

const patchMe = async (params: UpdateCredentialsParams) => {
  const response = await getAuth().client.settings.updateCredentials(params);
  persistAuthAccount(response, params);
  patchMeSuccess(response);
  return response;
};

const persistAuthAccount = (account: CredentialAccount, params?: Record<string, any>) => {
  if (!account?.url) return;
  const key = `authAccount:${account.url}`;
  KVStore.getItem(key)
    .then((oldAccount: any) => {
      const settings = oldAccount?.settings_store ?? {};
      account.settings_store ??= settings;
      if (params) account.settings_store ??= params.pleroma_settings_store ?? {};
      KVStore.setItem(key, account);
    })
    .catch(console.error);
};

const fetchMeSuccess = async (account: CredentialAccount) => {
  const { client } = getAuth();

  setSentryAccount(account);

  const settings =
    account.settings_store?.['nicolium'] ??
    account.settings_store?.['nicolium_dev'] ??
    account.settings_store?.['pl_fe'] ??
    account.settings_store?.['pl_fe_dev'];

  if (settings) {
    useSettingsStore.getState().actions.loadUserSettings(settings);
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
          getActions().setCurrentAccount(account);
          return frontendConfig;
        } catch (error) {
          console.error('Failed to parse frontend config from account note', error);
        }
      }
    }
  }

  useComposeStore.getState().actions.importDefaultSettings(account);
  getActions().setCurrentAccount(account);
};

const patchMeSuccess = (me: CredentialAccount) => {
  queryClient.setQueryData(queryKeys.accounts.show(me.id), me);
  useComposeStore.getState().actions.importDefaultSettings(me);
  getActions().setCurrentAccount(me);
};

export {
  messages,
  otpVerify,
  verifyCredentials,
  logIn,
  logOut,
  switchAccount,
  fetchOwnAccounts,
  register,
  fetchCaptcha,
  authLoggedIn,
  fetchMe,
  patchMe,
};
