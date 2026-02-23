import * as v from 'valibot';

import { rssFeedSchema } from '../entities';
import { filteredArray } from '../entities/utils';

import type { PlApiBaseClient } from '../client-base';

type EmptyObject = Record<string, never>;

const rssFeedSubscriptions = (client: PlApiBaseClient) => ({
  /**
   * Requires features{@link Features.rssFeedSubscriptions}.
   */
  fetchRssFeedSubscriptions: async () => {
    const response = await client.request('/api/v1/pleroma/rss_feed_subscriptions');

    return v.parse(filteredArray(rssFeedSchema), response.json);
  },

  /**
   * Requires features{@link Features.rssFeedSubscriptions}.
   */
  createRssFeedSubscription: async (url: string) => {
    const response = await client.request('/api/v1/pleroma/rss_feed_subscriptions', {
      method: 'POST',
      body: { url },
    });

    return v.parse(rssFeedSchema, response.json);
  },

  /**
   * Requires features{@link Features.rssFeedSubscriptions}.
   */
  deleteRssFeedSubscription: async (url: string) => {
    const response = await client.request<EmptyObject>('/api/v1/pleroma/rss_feed_subscriptions', {
      method: 'DELETE',
      body: { url },
    });

    return response.json;
  },
});

export { rssFeedSubscriptions };
