import * as v from 'valibot';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/AsyncRefresh/}
 */
const asyncRefreshSchema = v.object({
  async_refresh: v.object({
    id: v.string(),
    status: v.picklist(['running', 'finished']),
    result_count: v.nullable(v.number()),
  }),
});

/**
 * @category Entity types
 */
type AsyncRefresh = v.InferOutput<typeof asyncRefreshSchema>;

export { asyncRefreshSchema, type AsyncRefresh };
