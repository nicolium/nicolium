import * as v from 'valibot';

import { gifResultSchema } from './gif-result';
import { filteredArray } from './utils';

/**
 * @category Schemas
 */
const gifResultsSchema = v.object({
  results: filteredArray(gifResultSchema),
  provider: v.fallback(v.nullable(v.string()), null),
});

/**
 * @category Entity types
 */
type GifResults = v.InferOutput<typeof gifResultsSchema>;

export { gifResultsSchema, type GifResults };
