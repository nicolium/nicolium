import * as v from 'valibot';

/**
 * @category Schemas
 */
const storyMediaSchema = v.pipe(
  v.any(),
  v.transform((media) => ({
    id: media.media_id,
    url: media.media_url,
    type: media.media_type,
  })),
  v.object({
    id: v.string(),
    url: v.string(),
    type: v.picklist(['photo', 'video']),
  }),
);

/**
 * @category Entity types
 */
type StoryMedia = v.InferOutput<typeof storyMediaSchema>;

export { storyMediaSchema, type StoryMedia };
