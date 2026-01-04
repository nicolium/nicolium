import * as v from 'valibot';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/QuoteApproval/}
 */
const quoteApprovalSchema = v.object({
  automatic: v.array(v.picklist(['public', 'followers', 'following', 'unsupported_policy'])),
  manual: v.array(v.picklist(['public', 'followers', 'following', 'unsupported_policy'])),
  current_user: v.picklist(['automatic', 'manual', 'denied', 'unknown']),
});

/**
 * @category Entity types
 */
type QuoteApproval = v.InferOutput<typeof quoteApprovalSchema>;

export { quoteApprovalSchema, type QuoteApproval };
