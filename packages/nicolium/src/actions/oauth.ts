/**
 * OAuth: create and revoke tokens.
 * Tokens can be used by users and apps.
 * https://docs.joinmastodon.org/methods/apps/oauth/
 * @module @/actions/oauth
 * @see module:@/actions/auth
 */

import { PlApiClient, type GetTokenParams, type RevokeTokenParams } from 'pl-api';

import * as BuildConfig from '@/build-config';
import { getMe } from '@/stores/auth';
import { parseBaseURL } from '@/utils/auth';

const obtainOAuthToken = async (params: GetTokenParams, baseURL?: string) => {
  const client = new PlApiClient((baseURL ?? BuildConfig.BACKEND_URL) || '');
  await client.instance.getInstance();

  return client.oauth.getToken(params);
};

const revokeOAuthToken = async (params: RevokeTokenParams) => {
  const me = getMe();
  const baseURL = parseBaseURL(me || undefined) || BuildConfig.BACKEND_URL;
  const client = new PlApiClient(baseURL || '');
  return client.oauth.revokeToken(params);
};

export { obtainOAuthToken, revokeOAuthToken };
