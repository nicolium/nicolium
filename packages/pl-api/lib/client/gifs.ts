import * as v from 'valibot';

import { gifResultsSchema } from '@/entities/gif-results';

import type { PlApiBaseClient } from '@/client-base';

const gifs = (client: PlApiBaseClient) => ({
  /**
   * Requires features{@link Features.gifPicker}.
   */
  searchGifs: async (query: string) => {
    const response = await client.request('/api/v1/gifs', { params: { q: query } });

    return v.parse(gifResultsSchema, response.json);
  },
});

export { gifs };
