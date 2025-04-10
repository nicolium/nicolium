import * as v from 'valibot';

import { accountSchema } from './account';

/**
 * @category Schemas
 */
const shoutMessageSchema = v.object({
  id: v.number(),
  text: v.string(),
  author: accountSchema,
});

/**
 * @category Entity types
 */
type ShoutMessage = v.InferOutput<typeof shoutMessageSchema>;

export { shoutMessageSchema, type ShoutMessage };
