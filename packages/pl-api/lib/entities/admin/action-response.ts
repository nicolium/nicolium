import * as v from 'valibot';

/**
 * @category Admin schemas
 * @see {@link https://docs.gotosocial.org/en/latest/api/swagger/}
 */
const adminActionResponseSchema = v.object({
  action_id: v.fallback(v.string(), ''),
});

/**
 * @category Admin entity types
 */
type AdminActionResponse = v.InferOutput<typeof adminActionResponseSchema>;

export { adminActionResponseSchema, type AdminActionResponse };
