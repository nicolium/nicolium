import * as v from 'valibot';

import { datetimeSchema } from '../utils';

/**
 * @category Admin schemas
 * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#get-apiv1pleromaadminusersinvites}
 */
const adminInviteSchema = v.object({
  id: v.fallback(v.nullable(v.number()), null),
  token: v.string(),
  used: v.fallback(v.boolean(), false),
  expires_at: v.fallback(v.nullable(datetimeSchema), null),
  uses: v.fallback(v.number(), 0),
  max_use: v.fallback(v.nullable(v.number()), null),
  invite_type: v.fallback(v.string(), 'one_time'),
});

/**
 * @category Admin entity types
 */
type AdminInvite = v.InferOutput<typeof adminInviteSchema>;

export { adminInviteSchema, type AdminInvite };
