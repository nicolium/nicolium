import * as v from 'valibot';

import { datetimeSchema } from '../utils';

/**
 * Admin view of a custom emoji.
 *
 * @category Admin schemas
 * @see {@link https://docs.gotosocial.org/en/latest/api/swagger/}
 */
const adminCustomEmojiSchema = v.object({
  category: v.fallback(v.nullable(v.string()), null),
  content_type: v.fallback(v.nullable(v.string()), null),
  disabled: v.fallback(v.boolean(), false),
  domain: v.fallback(v.nullable(v.string()), null),
  id: v.string(),
  shortcode: v.string(),
  static_url: v.fallback(v.string(), ''),
  total_file_size: v.fallback(v.nullable(v.number()), null),
  updated_at: v.fallback(v.optional(datetimeSchema), undefined),
  uri: v.fallback(v.string(), ''),
  url: v.string(),
  visible_in_picker: v.fallback(v.boolean(), true),
});

/**
 * @category Entity types
 */
type AdminCustomEmoji = v.InferOutput<typeof adminCustomEmojiSchema>;

export { adminCustomEmojiSchema, type AdminCustomEmoji };
