import * as v from 'valibot';

import { applicationSchema, credentialApplicationSchema } from '@/entities';

import type { PlApiBaseClient } from '@/client-base';
import type { CreateApplicationParams } from '@/params/apps';

/** Register client applications that can be used to obtain OAuth tokens. */
const apps = (client: PlApiBaseClient) => ({
  /**
   * Create an application
   * Create a new application to obtain OAuth2 credentials.
   * @see {@link https://docs.joinmastodon.org/methods/apps/#create}
   */
  createApplication: async (params: CreateApplicationParams) => {
    const response = await client.request('/api/v1/apps', { method: 'POST', body: params });

    return v.parse(credentialApplicationSchema, response.json);
  },

  /**
   * Verify your app works
   * Confirm that the app’s OAuth2 credentials work.
   * @see {@link https://docs.joinmastodon.org/methods/apps/#verify_credentials}
   */
  verifyApplication: async () => {
    const response = await client.request('/api/v1/apps/verify_credentials');

    return v.parse(applicationSchema, response.json);
  },
});

export { apps };
