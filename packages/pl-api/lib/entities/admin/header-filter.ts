import * as v from 'valibot';

import { datetimeSchema } from '../utils';

/**
 * @category Admin schemas
 * @see {@link https://docs.gotosocial.org/en/latest/api/swagger/}
 */
const adminHeaderFilterSchema = v.object({
  id: v.fallback(v.string(), ''),
  header: v.fallback(v.string(), ''),
  regex: v.fallback(v.string(), ''),
  created_at: v.fallback(v.optional(datetimeSchema), undefined),
  created_by: v.fallback(v.optional(v.string()), undefined),
});

/**
 * @category Admin entity types
 */
type AdminHeaderFilter = v.InferOutput<typeof adminHeaderFilterSchema>;

export { adminHeaderFilterSchema, type AdminHeaderFilter };
