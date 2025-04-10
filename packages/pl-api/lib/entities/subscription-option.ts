import * as v from 'valibot';

/**
 * @category Schemas
 */
const subscriptionOptionSchema = v.object({
  /** Subscription type */
  type: v.picklist(['monero']),
  /** CAIP-2 chain ID. */
  chain_id: v.fallback(v.string(), ''),
  /** Subscription price (only for Monero) */
  price: v.fallback(v.nullable(v.number()), null),
  /** Payout address (only for Monero) */
  payout_address: v.fallback(v.string(), ''),
});

/**
 * @category Entity types
 */
type SubscriptionOption = v.InferOutput<typeof subscriptionOptionSchema>;

export {
  subscriptionOptionSchema,
  type SubscriptionOption,
};
