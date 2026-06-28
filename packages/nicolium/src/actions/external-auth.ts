/**
 * External Auth: workflow for logging in to remote servers.
 * @module @/actions/external_auth
 * @see module:@/actions/auth
 * @see module:@/actions/apps
 * @see module:@/actions/oauth
 */

import { instanceSchema, PlApiClient, type Instance } from 'pl-api';
import * as v from 'valibot';

import { createApp } from '@/actions/apps';
import { obtainOAuthToken } from '@/actions/oauth';
import { useAuthStore, addToken, verifyCredentials } from '@/stores/auth';
import { parseBaseURL } from '@/utils/auth';
import sourceCode from '@/utils/code';
import { getInstanceScopes } from '@/utils/scopes';

const fetchExternalInstance = (baseURL: string) =>
  new PlApiClient(baseURL).instance
    .getInstance()
    .then((instance) => instance)
    .catch((error) => {
      if (error.response?.status === 401) {
        // Authenticated fetch is enabled.
        // Continue with a limited featureset.
        return v.parse(instanceSchema, {});
      } else {
        throw error;
      }
    });

const createExternalApp = (instance: Instance, baseURL?: string) => {
  const params = {
    client_name: `${sourceCode.displayName} (${new URL(window.origin).host})`,
    redirect_uris: `${window.location.origin}/login/external`,
    website: sourceCode.homepage,
    scopes: getInstanceScopes(instance, undefined, true),
  };

  return createApp(params, baseURL);
};

const externalAuthorize = (instance: Instance, baseURL: string) => {
  const scopes = getInstanceScopes(instance, undefined, true);

  return createExternalApp(instance, baseURL).then((app) => {
    const { client_id, redirect_uri } = app;

    const query = new URLSearchParams({
      client_id,
      redirect_uri: redirect_uri ?? app.redirect_uris[0],
      response_type: 'code',
      scope: scopes,
    });

    localStorage.setItem('nicolium:external:app', JSON.stringify(app));
    localStorage.setItem('nicolium:external:baseurl', baseURL);
    localStorage.setItem('nicolium:external:scopes', scopes);

    window.location.href = `${baseURL}/oauth/authorize?${query.toString()}`;
  });
};

const externalLogin = (host: string) => {
  const baseURL = parseBaseURL(host) || parseBaseURL(`https://${host}`);

  return fetchExternalInstance(baseURL).then((instance) => {
    externalAuthorize(instance, baseURL);
  });
};

const loginWithCode = async (code: string) => {
  const app = JSON.parse(localStorage.getItem('nicolium:external:app')!);
  const { client_id, client_secret, redirect_uri } = app;
  const baseURL = localStorage.getItem('nicolium:external:baseurl')!;
  const scope = localStorage.getItem('nicolium:external:scopes')!;

  const params = {
    client_id,
    client_secret,
    redirect_uri,
    grant_type: 'authorization_code',
    scope,
    code,
  };

  const token = await obtainOAuthToken(params, baseURL);
  addToken(token, app);
  const account = await verifyCredentials(token.access_token, baseURL);
  useAuthStore.getState().actions.switchAccount(account);
  window.location.href = '/';
};

export { externalLogin, loginWithCode };
