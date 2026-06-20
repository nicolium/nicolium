import * as v from 'valibot';

import { datetimeSchema } from '../utils';

/**
 * @category Admin schemas
 * @see {@link https://docs.gotosocial.org/en/latest/api/swagger/}
 */
const adminDomainPermissionSubscriptionSchema = v.object({
  id: v.fallback(v.string(), ''),
  priority: v.fallback(v.number(), 0),
  title: v.fallback(v.optional(v.string()), undefined),
  permission_type: v.fallback(v.picklist(['block', 'allow']), 'block'),
  as_draft: v.fallback(v.boolean(), true),
  adopt_orphans: v.fallback(v.boolean(), false),
  remove_retracted: v.fallback(v.boolean(), true),
  uri: v.fallback(v.string(), ''),
  content_type: v.fallback(v.string(), ''),
  fetch_username: v.fallback(v.optional(v.string()), undefined),
  fetch_password: v.fallback(v.optional(v.string()), undefined),
  created_at: v.fallback(v.optional(datetimeSchema), undefined),
  created_by: v.fallback(v.optional(v.string()), undefined),
  fetched_at: v.fallback(v.optional(datetimeSchema), undefined),
  successfully_fetched_at: v.fallback(v.optional(datetimeSchema), undefined),
  count: v.fallback(v.number(), 0),
  error: v.fallback(v.optional(v.string()), undefined),
});

/**
 * @category Admin entity types
 */
type AdminDomainPermissionSubscription = v.InferOutput<
  typeof adminDomainPermissionSubscriptionSchema
>;

export { adminDomainPermissionSubscriptionSchema, type AdminDomainPermissionSubscription };
