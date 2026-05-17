import * as v from 'valibot';

import { datetimeSchema } from '../utils';

/**
 * @category Admin schemas
 * @see {@link https://docs.joinmastodon.org/entities/Admin_DomainAllow/}
 */
const adminDomainAllowSchema = v.pipe(
  v.any(),
  v.transform((domainAllow) => ({
    id: domainAllow.host,
    domain: domainAllow.host,
    is_imported: domainAllow.isImported,
    ...domainAllow,
  })),
  v.object({
    id: v.string(),
    domain: v.string(),
    created_at: v.fallback(v.nullable(datetimeSchema), null),
    is_imported: v.fallback(v.nullable(v.boolean()), null),
  }),
);

/**
 * @category Admin entity types
 */
type AdminDomainAllow = v.InferOutput<typeof adminDomainAllowSchema>;

export { adminDomainAllowSchema, type AdminDomainAllow };
