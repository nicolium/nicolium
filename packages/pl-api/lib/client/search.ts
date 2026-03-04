import * as v from 'valibot';

import { locationSchema, searchSchema } from '@/entities';
import { filteredArray } from '@/entities/utils';

import type { PlApiBaseClient } from '@/client-base';
import type { SearchParams } from '@/params/search';
import type { RequestMeta } from '@/request';

const search = (client: PlApiBaseClient) => ({
  /**
   * Perform a search
   * @see {@link https://docs.joinmastodon.org/methods/search/#v2}
   */
  search: async (q: string, params?: SearchParams, meta?: RequestMeta) => {
    const response = await client.request('/api/v2/search', { ...meta, params: { ...params, q } });

    const parsedSearch = v.parse(searchSchema, response.json);

    // A workaround for Pleroma/Akkoma getting into a loop of returning the same account/status when resolve === true.
    if (params && params.resolve && params.offset && params.offset > 0) {
      const firstAccount = parsedSearch.accounts[0];
      if (firstAccount && [firstAccount.url, firstAccount.acct].includes(q)) {
        parsedSearch.accounts = parsedSearch.accounts.slice(1);
      }
      const firstStatus = parsedSearch.statuses[0];
      if (firstStatus && [firstStatus.uri, firstStatus.url].includes(q)) {
        parsedSearch.statuses = parsedSearch.statuses.slice(1);
      }
    }

    return parsedSearch;
  },

  /**
   * Searches for locations
   *
   * Requires features{@link Features.events}.
   * @see {@link https://github.com/mkljczk/pl/blob/fork/docs/development/API/pleroma_api.md#apiv1pleromasearchlocation}
   */
  searchLocation: async (q: string, meta?: RequestMeta) => {
    const response = await client.request('/api/v1/pleroma/search/location', {
      ...meta,
      params: { q },
    });

    return v.parse(filteredArray(locationSchema), response.json);
  },
});

export { search };
