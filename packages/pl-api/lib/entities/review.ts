import * as v from 'valibot';

import { itemSchema } from './item';
import { datetimeSchema } from './utils';

/**
 * @category Schemas
 * @see {@link https://neodb.social/developer}
 */
const reviewSchema = v.object({
  url: v.string(),
  api_url: v.string(),
  visibility: v.pipe(v.number(), v.minValue(0), v.maxValue(2)),
  post_id: v.nullable(v.number()),
  item: itemSchema,
  created_time: datetimeSchema,
  title: v.string(),
  body: v.string(),
  html_content: v.string(),
});

/**
 * @category Entity types
 */
type Review = v.InferOutput<typeof reviewSchema>;

export {
  reviewSchema,
  type Review,
};
