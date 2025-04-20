import * as v from 'valibot';

import { statusSchema } from './status';
import { filteredArray } from './utils';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/Context/}
 */
const contextSchema = v.object({
  ancestors: filteredArray(statusSchema),
  descendants: filteredArray(statusSchema),
  references: v.fallback(filteredArray(statusSchema), []),
});

/**
 * @category Entity types
 */
type Context = v.InferOutput<typeof contextSchema>;

export { contextSchema, type Context };
