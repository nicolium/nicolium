import * as v from 'valibot';

import type { PlApiBaseClient } from '@/client-base';

const oembed = (client: PlApiBaseClient) => ({
  /**
   * Get OEmbed info as JSON
   * @see {@link https://docs.joinmastodon.org/methods/oembed/#get}
   */
  getOembed: async (url: string, maxwidth?: number, maxheight?: number) => {
    const response = await client.request('/api/oembed', { params: { url, maxwidth, maxheight } });

    return v.parse(
      v.object({
        type: v.fallback(v.string(), 'rich'),
        version: v.fallback(v.string(), ''),
        author_name: v.fallback(v.string(), ''),
        author_url: v.fallback(v.string(), ''),
        provider_name: v.fallback(v.string(), ''),
        provider_url: v.fallback(v.string(), ''),
        cache_age: v.number(),
        html: v.string(),
        width: v.fallback(v.nullable(v.number()), null),
        height: v.fallback(v.nullable(v.number()), null),
      }),
      response.json,
    );
  },
});

export { oembed };
