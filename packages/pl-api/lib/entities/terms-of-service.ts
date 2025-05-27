import * as v from 'valibot';

import { dateSchema } from './utils';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/TermsOfService/}
 */
const termsOfServiceSchema = v.object({
  effective_date: dateSchema,
  effective: v.boolean(),
  content: v.string(),
  succeeded_by: v.fallback(v.nullable(dateSchema), null),
});

/**
 * @category Entity types
 */
type TermsOfService = v.InferOutput<typeof termsOfServiceSchema>;

export { termsOfServiceSchema, type TermsOfService };
