import * as v from 'valibot';

import { datetimeSchema } from './utils';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/PrivacyPolicy/}
 */
const privacyPolicySchema = v.object({
  updated_at: datetimeSchema,
  content: v.string(),
});

/**
 * @category Entity types
 */
type PrivacyPolicy = v.InferOutput<typeof privacyPolicySchema>;

export { privacyPolicySchema, type PrivacyPolicy };
