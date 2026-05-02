import * as v from 'valibot';

import { datetimeSchema } from '../utils';

/**
 * @category Admin schemas
 * @see {@link https://docs.joinmastodon.org/entities/Admin_DomainBlock/}
 */
const adminDomainBlockSchema = v.object({
  id: v.string(),
  domain: v.string(),
  digest: v.fallback(v.optional(v.string()), undefined),
  created_at: v.fallback(v.nullable(datetimeSchema), null),
  severity: v.fallback(v.picklist(['silence', 'suspend', 'noop']), 'suspend'),
  reject_media: v.fallback(v.optional(v.boolean()), undefined),
  reject_reports: v.fallback(v.optional(v.boolean()), undefined),
  private_comment: v.fallback(v.nullable(v.string()), null),
  public_comment: v.fallback(v.nullable(v.string()), null),
  obfuscate: v.boolean(),
});

/**
 * @category Admin entity types
 */
type AdminDomainBlock = v.InferOutput<typeof adminDomainBlockSchema>;

export { adminDomainBlockSchema, type AdminDomainBlock };
