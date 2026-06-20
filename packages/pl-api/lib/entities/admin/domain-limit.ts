import * as v from 'valibot';

import { datetimeSchema } from '../utils';

const adminAccountsPolicySchema = v.picklist(['no_action', 'mute']);

const adminFollowsPolicySchema = v.picklist([
  'no_action',
  'manual_approval',
  'reject_non_mutual',
  'reject_all',
]);

const adminMediaPolicySchema = v.picklist(['no_action', 'mark_sensitive', 'reject']);

const adminStatusesPolicySchema = v.picklist(['no_action', 'filter_warn', 'filter_hide']);

/**
 * @category Admin schemas
 * @see {@link https://docs.gotosocial.org/en/latest/api/swagger/}
 */
const adminDomainLimitSchema = v.object({
  id: v.fallback(v.string(), ''),
  domain: v.fallback(v.string(), ''),
  created_at: v.fallback(v.optional(datetimeSchema), undefined),
  created_by: v.fallback(v.optional(v.string()), undefined),
  accounts_policy: v.fallback(adminAccountsPolicySchema, 'no_action'),
  follows_policy: v.fallback(adminFollowsPolicySchema, 'no_action'),
  media_policy: v.fallback(adminMediaPolicySchema, 'no_action'),
  statuses_policy: v.fallback(adminStatusesPolicySchema, 'no_action'),
  content_warning: v.fallback(v.optional(v.string()), undefined),
  public_comment: v.fallback(v.optional(v.string()), undefined),
  private_comment: v.fallback(v.optional(v.string()), undefined),
});

/**
 * @category Admin entity types
 */
type AdminDomainLimit = v.InferOutput<typeof adminDomainLimitSchema>;

export { adminDomainLimitSchema, type AdminDomainLimit };
