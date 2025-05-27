import * as v from 'valibot';

import { baseFilterSchema } from './filter';

const filterSchema = v.omit(baseFilterSchema, ['keywords', 'statuses']);

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/FilterResult/}
 */
const filterResultSchema = v.object({
  filter: filterSchema,
  keyword_matches: v.fallback(v.nullable(v.string()), null),
  status_matches: v.fallback(v.nullable(v.string()), null),
});

/**
 * @category Entity types
 */
type FilterResult = v.InferOutput<typeof filterResultSchema>;

export { filterResultSchema, type FilterResult };
