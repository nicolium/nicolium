import * as v from 'valibot';

/**
 * @category Schemas
 */
const gifResultSchema = v.object({
  id: v.string(),
  description: v.fallback(v.nullable(v.string()), null),
  url: v.pipe(v.string(), v.url()),
});

/**
 * @category Entity types
 */
type GifResult = v.InferOutput<typeof gifResultSchema>;

export { gifResultSchema, type GifResult };
