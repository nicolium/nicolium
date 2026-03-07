/**
 * Auth: login & registration workflow.
 * This file contains abstractions over auth concepts.
 * @module @/actions/auth
 * @see module:@/actions/apps
 * @see module:@/actions/oauth
 * @see module:@/actions/security
 */
import {
  PlApiClient,
  type Account,
  type CreateAccountParams,
  type CredentialAccount,
  type CredentialApplication,
  type Token,
} from 'pl-api';
import { defineMessages } from 'react-intl';

import { createAccount } from '@/actions/accounts';
import { createApp } from '@/actions/apps';
import { fetchMeSuccess, fetchMeFail } from '@/actions/me';
import { obtainOAuthToken, revokeOAuthToken } from '@/actions/oauth';
import { type NicoliumResponse, getClient } from '@/api';
import * as BuildConfig from '@/build-config';
import { selectAccount } from '@/queries/accounts/selectors';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { unsetSentryAccount } from '@/sentry';
import KVStore from '@/storage/kv-store';
import toast from '@/toast';
import { getLoggedInAccount, parseBaseURL } from '@/utils/auth';
import sourceCode from '@/utils/code';
import { normalizeUsername } from '@/utils/input';
import { getScopes } from '@/utils/scopes';
import { isStandalone } from '@/utils/state';

import type { AppDispatch, RootState } from '@/store';

const SWITCH_ACCOUNT = 'SWITCH_ACCOUNT' as const;

const AUTH_APP_CREATED = 'AUTH_APP_CREATED' as const;
const AUTH_APP_AUTHORIZED = 'AUTH_APP_AUTHORIZED' as const;
const AUTH_LOGGED_IN = 'AUTH_LOGGED_IN' as const;
const AUTH_LOGGED_OUT = 'AUTH_LOGGED_OUT' as const;

const VERIFY_CREDENTIALS_REQUEST = 'VERIFY_CREDENTIALS_REQUEST' as const;
const VERIFY_CREDENTIALS_SUCCESS = 'VERIFY_CREDENTIALS_SUCCESS' as const;
const VERIFY_CREDENTIALS_FAIL = 'VERIFY_CREDENTIALS_FAIL' as const;

const AUTH_ACCOUNT_REMEMBER_SUCCESS = 'AUTH_ACCOUNT_REMEMBER_SUCCESS' as const;

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

const noOp = () =>
  new Promise((f) => {
    f(undefined);
  });

const createAppAndToken = () => (dispatch: AppDispatch) =>
  dispatch(createAuthApp()).then(() => dispatch(createAppToken()));

interface AuthAppCreatedAction {
  type: typeof AUTH_APP_CREATED;
  app: CredentialApplication;
}

const createAuthApp = () => (dispatch: AppDispatch, getState: () => RootState) => {
  const params = {
    client_name: `${sourceCode.displayName} (${new URL(window.origin).host})`,
    redirect_uris: 'urn:ietf:wg:oauth:2.0:oob',
    scopes: getScopes(getState()),
    website: sourceCode.homepage,
  };

  return createApp(params).then((app) =>
    dispatch<AuthAppCreatedAction>({ type: AUTH_APP_CREATED, app }),
  );
};

interface AuthAppAuthorizedAction {
  type: typeof AUTH_APP_AUTHORIZED;
  app: CredentialApplication;
  token: Token;
}

const createAppToken = () => (dispatch: AppDispatch, getState: () => RootState) => {
  const app = getState().auth.app!;

  const params = {
    client_id: app.client_id,
    client_secret: app.client_secret,
    redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
    grant_type: 'client_credentials',
    scope: getScopes(getState()),
  };

  return obtainOAuthToken(params).then((token) =>
    dispatch<AuthAppAuthorizedAction>({ type: AUTH_APP_AUTHORIZED, app, token }),
  );
};

const createUserToken =
  (username: string, password: string) => (dispatch: AppDispatch, getState: () => RootState) => {
    const app = getState().auth.app;

    const params = {
      client_id: app?.client_id!,
      client_secret: app?.client_secret!,
      redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
      grant_type: 'password',
      username: username,
      password: password,
      scope: getScopes(getState()),
    };

    return obtainOAuthToken(params).then((token) => dispatch(authLoggedIn(token, app)));
  };

const otpVerify =
  (code: string, mfa_token: string) => (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const app = state.auth.app;
    const baseUrl = parseBaseURL(state.me || undefined) || BuildConfig.BACKEND_URL;
    const client = new PlApiClient(baseUrl);
    return client.oauth
      .mfaChallenge({
        client_id: app?.client_id!,
        client_secret: app?.client_secret!,
        mfa_token: mfa_token,
        code: code,
        challenge_type: 'totp',
        // redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
        // scope: getScopes(getState()),
      })
      .then((token) => dispatch(authLoggedIn(token, app)));
  };

interface VerifyCredentialsRequestAction {
  type: typeof VERIFY_CREDENTIALS_REQUEST;
  token: string;
}

interface VerifyCredentialsSuccessAction {
  type: typeof VERIFY_CREDENTIALS_SUCCESS;
  token: string;
  account: CredentialAccount;
}

interface VerifyCredentialsFailAction {
  type: typeof VERIFY_CREDENTIALS_FAIL;
  token: string;
  error: unknown;
}

const verifyCredentials =
  (token: string, accountUrl?: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const baseURL = parseBaseURL(accountUrl) || BuildConfig.BACKEND_URL;

    dispatch<VerifyCredentialsRequestAction>({ type: VERIFY_CREDENTIALS_REQUEST, token });

    const client = new PlApiClient(baseURL, token);

    await client.instance.getInstance();

    return client.settings
      .verifyCredentials()
      .then((account) => {
        queryClient.setQueryData(queryKeys.accounts.show(account.id), account);
        dispatch<VerifyCredentialsSuccessAction>({
          type: VERIFY_CREDENTIALS_SUCCESS,
          token,
          account,
        });
        if (account.id === getState().me) dispatch(fetchMeSuccess(account));
        return account;
      })
      .catch((error) => {
        if (getState().me === null) dispatch(fetchMeFail(error));
        dispatch<VerifyCredentialsFailAction>({ type: VERIFY_CREDENTIALS_FAIL, token, error });
        throw error;
      });
  };

interface AuthAccountRememberSuccessAction {
  type: typeof AUTH_ACCOUNT_REMEMBER_SUCCESS;
  accountUrl: string;
  account: CredentialAccount;
}

const rememberAuthAccount =
  (accountUrl: string) => (dispatch: AppDispatch, getState: () => RootState) =>
    KVStore.getItemOrError(`authAccount:${accountUrl}`).then((account) => {
      queryClient.setQueryData(queryKeys.accounts.show(account.id), account);
      dispatch<AuthAccountRememberSuccessAction>({
        type: AUTH_ACCOUNT_REMEMBER_SUCCESS,
        account,
        accountUrl,
      });
      if (account.id === getState().me) dispatch(fetchMeSuccess(account));
      return account;
    });

const loadCredentials = (token: string, accountUrl: string) => (dispatch: AppDispatch) =>
  dispatch(rememberAuthAccount(accountUrl)).finally(() =>
    dispatch(verifyCredentials(token, accountUrl)),
  );

const logIn = (username: string, password: string) => (dispatch: AppDispatch) =>
  dispatch(createAuthApp())
    .then(() => dispatch(createUserToken(normalizeUsername(username), password)))
    .catch((error: { response: NicoliumResponse }) => {
      if (error.response?.json?.error === 'mfa_required') {
        // If MFA is required, throw the error and handle it in the component.
        throw error;
      } else if (error.response?.json?.identifier === 'awaiting_approval') {
        toast.error(messages.awaitingApproval);
      } else {
        // Return "wrong password" message.
        toast.error(messages.invalidCredentials);
      }
      throw error;
    });

interface AuthLoggedOutAction {
  type: typeof AUTH_LOGGED_OUT;
  account: Account;
  standalone: boolean;
}

const logOut = () => (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();
  const account = getLoggedInAccount(state);
  const standalone = isStandalone(state);

  if (!account) return dispatch(noOp);

  const token = state.auth.users[account.url].access_token;

  const params = {
    client_id: state.auth.tokens[token]?.client_id ?? state.auth.app?.client_id!,
    client_secret: state.auth.tokens[token]?.client_secret ?? state.auth.app?.client_secret!,
    token,
  };

  return dispatch(revokeOAuthToken(params)).finally(() => {
    // Clear all stored cache from React Query
    queryClient.invalidateQueries();
    queryClient.clear();

    // Clear the account from Sentry.
    unsetSentryAccount();

    dispatch<AuthLoggedOutAction>({ type: AUTH_LOGGED_OUT, account, standalone });

    toast.success(messages.loggedOut);
  });
};

interface SwitchAccountAction {
  type: typeof SWITCH_ACCOUNT;
  account: Account;
}

const switchAccount = (accountId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  const account = selectAccount(accountId);
  if (!account) return;

  if (typeof getState().me === 'string' && getState().me !== account.id) {
    // Clear all stored cache from React Query
    queryClient.invalidateQueries();
    queryClient.clear();
  }

  return dispatch<SwitchAccountAction>({ type: SWITCH_ACCOUNT, account });
};

const fetchOwnAccounts = () => (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();
  Object.values(state.auth.users).forEach((user) => {
    const account = selectAccount(user.id);
    if (!account) {
      dispatch(verifyCredentials(user.access_token, user.url)).catch(() => {
        console.warn(`Failed to load account: ${user.url}`);
      });
    }
  });
};

const register = (params: CreateAccountParams) => async (dispatch: AppDispatch) => {
  params.fullname = params.username;

  const { app } = await dispatch(createAppAndToken());

  return dispatch(createAccount(params)).then(({ response }) => {
    if ('identifier' in response) {
      toast.info(response.message);
    } else {
      return dispatch(authLoggedIn(response, app));
    }
  });
};

const fetchCaptcha = () => (_dispatch: AppDispatch, getState: () => RootState) =>
  getClient(getState).oauth.getCaptcha();

interface AuthLoggedInAction {
  type: typeof AUTH_LOGGED_IN;
  token: Token;
  app?: CredentialApplication;
}

const authLoggedIn =
  (token: Token, app?: CredentialApplication | null) => (dispatch: AppDispatch) => {
    dispatch<AuthLoggedInAction>({ type: AUTH_LOGGED_IN, token, app: app ?? undefined });
    return token;
  };

type AuthAction =
  | SwitchAccountAction
  | AuthAppCreatedAction
  | AuthAppAuthorizedAction
  | AuthLoggedInAction
  | AuthLoggedOutAction
  | VerifyCredentialsRequestAction
  | VerifyCredentialsSuccessAction
  | VerifyCredentialsFailAction
  | AuthAccountRememberSuccessAction;

export {
  SWITCH_ACCOUNT,
  AUTH_APP_CREATED,
  AUTH_APP_AUTHORIZED,
  AUTH_LOGGED_IN,
  AUTH_LOGGED_OUT,
  VERIFY_CREDENTIALS_REQUEST,
  VERIFY_CREDENTIALS_SUCCESS,
  VERIFY_CREDENTIALS_FAIL,
  AUTH_ACCOUNT_REMEMBER_SUCCESS,
  messages,
  otpVerify,
  verifyCredentials,
  loadCredentials,
  logIn,
  logOut,
  switchAccount,
  fetchOwnAccounts,
  register,
  fetchCaptcha,
  authLoggedIn,
  type AuthAction,
};
