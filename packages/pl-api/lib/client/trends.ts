import * as v from 'valibot';

import { statusSchema, tagSchema, trendsLinkSchema } from '../entities';
import { filteredArray } from '../entities/utils';
import { PIXELFED } from '../features';

import type { PlApiBaseClient } from '../client-base';
import type { GetTrendingLinks, GetTrendingStatuses, GetTrendingTags } from '../params/trends';

const trends = (client: PlApiBaseClient) => ({
  /**
   * View trending tags
   * Tags that are being used more frequently within the past week.
   * @see {@link https://docs.joinmastodon.org/methods/trends/#tags}
   */
  getTrendingTags: async (params?: GetTrendingTags) => {
    const response = await client.request(
      client.features.version.software === PIXELFED
        ? '/api/v1.1/discover/posts/hashtags'
        : '/api/v1/trends/tags',
      { params },
    );

    return v.parse(filteredArray(tagSchema), response.json);
  },

  /**
   * View trending statuses
   * Statuses that have been interacted with more than others.
   * @see {@link https://docs.joinmastodon.org/methods/trends/#statuses}
   */
  getTrendingStatuses: async (params?: GetTrendingStatuses) => {
    const response = await client.request(
      client.features.version.software === PIXELFED
        ? '/api/pixelfed/v2/discover/posts/trending'
        : '/api/v1/trends/statuses',
      { params },
    );

    return v.parse(filteredArray(statusSchema), response.json);
  },

  /**
   * View trending links
   * Links that have been shared more than others.
   * @see {@link https://docs.joinmastodon.org/methods/trends/#links}
   */
  getTrendingLinks: async (params?: GetTrendingLinks) => {
    const response = await client.request('/api/v1/trends/links', { params });

    return v.parse(filteredArray(trendsLinkSchema), response.json);
  },
});

export { trends };
