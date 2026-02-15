import * as v from 'valibot';

/**
 * @category Schemas
 */
const subscriptionOptionSchema = v.variant('type', [
  v.object({
    /** Subscription type */
    type: v.literal('monero'),
    /** CAIP-2 chain ID. */
    chain_id: v.string(),
    /** Subscription price */
    price: v.nullable(v.number()),
    /** Payout address */
    payout_address: v.string(),
  }),
]);

/**
 * @category Entity types
 */
type SubscriptionOption = v.InferOutput<typeof subscriptionOptionSchema>;

export { subscriptionOptionSchema, type SubscriptionOption };
