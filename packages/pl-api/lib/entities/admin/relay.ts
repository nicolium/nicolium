import * as v from 'valibot';

import { datetimeSchema, filteredArray } from '../utils';

/**
 * @category Admin schemas
 * @see {@link https://docs.gotosocial.org/en/latest/api/swagger/}
 */
const adminRelayMatcherSchema = v.object({
  id: v.fallback(v.string(), ''),
  keyword: v.fallback(v.string(), ''),
  whole_word: v.fallback(v.boolean(), false),
  exclude: v.fallback(v.boolean(), false),
});

/**
 * @category Admin schemas
 */
const adminRelaySchema = v.pipe(
  v.any(),
  v.transform((data: any) => {
    if (!data.id) {
      // Pleroma
      return {
        id: data.actor,
        relay_actor_uri: data.actor,
        ...data,
      };
    } else if (data.status) {
      // Iceshrimp.NET
      return {
        approved: data.status === 'accepted',
        rejected: data.status === 'rejected',
        relay_actor_uri: data.actor,
        ...data,
      };
    }
  }),
  // GoToSocial
  v.object({
    id: v.fallback(v.string(), ''),
    relay_actor_uri: v.fallback(v.string(), ''),
    account_id: v.fallback(v.optional(v.string()), undefined),
    approved: v.fallback(v.boolean(), false),
    created_at: v.fallback(v.optional(datetimeSchema), undefined),
    public: v.fallback(v.boolean(), false),
    unlisted: v.fallback(v.boolean(), false),
    match_by_default: v.fallback(v.boolean(), false),
    ignore_sensitive: v.fallback(v.boolean(), false),
    ignore_media: v.fallback(v.boolean(), false),
    ignore_replies: v.fallback(v.boolean(), false),
    matchers: filteredArray(adminRelayMatcherSchema),
    followed_back: v.fallback(v.boolean(), false),
    rejected: v.fallback(v.boolean(), false),
  }),
);

/**
 * @category Admin entity types
 */
type AdminRelayMatcher = v.InferOutput<typeof adminRelayMatcherSchema>;

/**
 * @category Admin entity types
 */
type AdminRelay = v.InferOutput<typeof adminRelaySchema>;

export { adminRelayMatcherSchema, adminRelaySchema, type AdminRelayMatcher, type AdminRelay };
