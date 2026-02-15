import * as v from 'valibot';

/**
 * @category Schemas
 */
const storyCarouselItemSchema = v.pipe(
  v.any(),
  v.transform((item) => ({
    account_id: item.pid,
    story_id: item.sid,
    ...item,
  })),
  v.object({
    account_id: v.string(),
    avatar: v.string(),
    local: v.boolean(),
    username: v.string(),
    latest: v.object({
      id: v.pipe(v.unknown(), v.transform(String)),
      type: v.string(),
      preview_url: v.string(),
    }),
    url: v.string(),
    seen: v.boolean(),
    story_id: v.pipe(v.unknown(), v.transform(String)),
  }),
);

/**
 * @category Entity types
 */
type StoryCarouselItem = v.InferOutput<typeof storyCarouselItemSchema>;

export { storyCarouselItemSchema, type StoryCarouselItem };
