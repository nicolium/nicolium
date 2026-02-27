import * as v from 'valibot';

import { asyncRefreshSchema } from '@/entities';

import type { PlApiBaseClient } from '@/client-base';

/** Experimental async refreshes API methods */
const asyncRefreshes = (client: PlApiBaseClient) => ({
  /**
   * Get Status of Async Refresh
   * @see {@link https://docs.joinmastodon.org/methods/async_refreshes/#show}
   */
  show: async (id: string) => {
    const response = await client.request(`/api/v1_alpha/async_refreshes/${id}`);

    return v.parse(asyncRefreshSchema, response.json);
  },
});

export { asyncRefreshes };
