import * as v from 'valibot';

/**
 * @category Admin schemas
 */
const adminRelaySchema = v.pipe(
  v.any(),
  v.transform((data: any) => ({ id: data.actor, actor: data.inbox, ...data })),
  v.object({
    actor: v.fallback(v.string(), ''),
    id: v.string(),
    followed_back: v.fallback(v.boolean(), false),
    status: v.optional(v.picklist(['requesting', 'accepted', 'rejected'])),
  }),
);

/**
 * @category Admin entity types
 */
type AdminRelay = v.InferOutput<typeof adminRelaySchema>;

export { adminRelaySchema, type AdminRelay };
