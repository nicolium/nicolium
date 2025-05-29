import * as v from 'valibot';

import { accountSchema } from './account';
import { datetimeSchema, filteredArray } from './utils';

/**
 * @category Schemas
 */
const storyNodeSchema = v.object({
  id: v.string(),
  type: v.string(),
  duration: v.number(),
  src: v.string(),
  created_at: datetimeSchema,
  expires_at: datetimeSchema,
  view_count: v.fallback(v.nullable(v.number()), null),
  seen: v.boolean(),
  progress: v.number(),
  can_reply: v.boolean(),
  can_react: v.boolean(),
  question: v.optional(v.string(), undefined),
  options: v.optional(v.array(v.string()), undefined),
  voted: v.optional(v.boolean(), undefined),
  voted_index: v.optional(v.number(), undefined),
});

/**
 * @category Entity types
 */
type StoryNode = v.InferOutput<typeof storyNodeSchema>;

/**
 * @category Schemas
 */
const storyProfileSchema = v.object({
  account: accountSchema,
  nodes: filteredArray(storyNodeSchema),
});

/**
 * @category Entity types
 */
type StoryProfile = v.InferOutput<typeof storyProfileSchema>;

export { storyNodeSchema, type StoryNode, storyProfileSchema, type StoryProfile };
