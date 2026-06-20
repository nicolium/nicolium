import * as v from 'valibot';

import { datetimeSchema } from '../utils';

/**
 * @category Admin schemas
 * @see {@link https://docs.gotosocial.org/en/latest/api/swagger/}
 */
const adminDomainPermissionSchema = v.object({
  id: v.fallback(v.string(), ''),
  domain: v.fallback(v.string(), ''),
  created_at: v.fallback(v.optional(datetimeSchema), undefined),
  created_by: v.fallback(v.optional(v.string()), undefined),
  obfuscate: v.fallback(v.optional(v.boolean()), undefined),
  permission_type: v.fallback(v.optional(v.picklist(['block', 'allow'])), undefined),
  private_comment: v.fallback(v.optional(v.string()), undefined),
  public_comment: v.fallback(v.optional(v.string()), undefined),
  comment: v.fallback(v.optional(v.string()), undefined),
  severity: v.fallback(v.optional(v.string()), undefined),
  silenced_at: v.fallback(v.optional(datetimeSchema), undefined),
  suspended_at: v.fallback(v.optional(datetimeSchema), undefined),
  subscription_id: v.fallback(v.optional(v.string()), undefined),
});

/**
 * @category Admin entity types
 */
type AdminDomainPermission = v.InferOutput<typeof adminDomainPermissionSchema>;

export { adminDomainPermissionSchema, type AdminDomainPermission };
