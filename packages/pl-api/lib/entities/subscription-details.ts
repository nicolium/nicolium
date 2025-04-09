import * as v from 'valibot';

import { datetimeSchema } from './utils';

/**
 * @category Schemas
 */
const subscriptionDetailsSchema = v.object({
  /** Subscription ID. */
  id: v.number(),
  /** The date when subscription expires. */
  expires_at: v.fallback(datetimeSchema, new Date().toISOString()),
});

/**
 * @category Entity types
 */
type SubscriptionDetails = v.InferOutput<typeof subscriptionDetailsSchema>;

export {
  subscriptionDetailsSchema,
  type SubscriptionDetails,
};
