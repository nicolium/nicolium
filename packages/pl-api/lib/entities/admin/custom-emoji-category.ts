import * as v from 'valibot';

/**
 * @category Admin schemas
 * @see {@link https://docs.gotosocial.org/en/latest/api/swagger/}
 */
const adminCustomEmojiCategorySchema = v.object({
  id: v.fallback(v.string(), ''),
  name: v.fallback(v.string(), ''),
});

/**
 * @category Admin entity types
 */
type AdminCustomEmojiCategory = v.InferOutput<typeof adminCustomEmojiCategorySchema>;

export { adminCustomEmojiCategorySchema, type AdminCustomEmojiCategory };
