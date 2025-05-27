import * as v from 'valibot';

import { dateSchema } from './utils';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/TermsOfService/}
 */
const termfsOfServiceSchema = v.object({
  effective_date: dateSchema,
  effective: v.boolean(),
  content: v.string(),
  succeeded_by: v.fallback(v.nullable(dateSchema), null),
});

/**
 * @category Entity types
 */
type TermfsOfService = v.InferOutput<typeof termfsOfServiceSchema>;

export { termfsOfServiceSchema, type TermfsOfService };
