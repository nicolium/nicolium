import * as v from 'valibot';

import { gifResultsSchema } from '@/entities/gif-results';

import type { PlApiBaseClient } from '@/client-base';
import type { RequestMeta } from '@/request';

const gifs = (client: PlApiBaseClient) => ({
  /**
   * Requires features{@link Features.gifPicker}.
   */
  searchGifs: async (query: string, meta?: RequestMeta) => {
    const response = await client.request('/api/v1/gifs', { ...meta, params: { q: query } });

    return v.parse(gifResultsSchema, response.json);
  },
});

export { gifs };
