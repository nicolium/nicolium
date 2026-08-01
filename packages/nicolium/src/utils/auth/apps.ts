/**
 * Apps: manage OAuth applications.
 * Particularly useful for auth.
 * https://docs.joinmastodon.org/methods/apps/
 * @module @/actions/apps
 * @see module:@/actions/auth
 */

import { PlApiClient, type CreateApplicationParams } from 'pl-api';

import * as BuildConfig from '@/build-config';

const createApp = (params: CreateApplicationParams, baseURL?: string) => {
  const client = new PlApiClient((baseURL ?? BuildConfig.BACKEND_URL) || '');

  return client.apps.createApplication(params);
};

export { createApp };
