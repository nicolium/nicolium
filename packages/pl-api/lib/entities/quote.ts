import * as v from 'valibot';

import { type Status, statusSchema } from './status';

const quoteStateSchema = v.picklist([
  'pending',
  'accepted',
  'rejected',
  'revoked',
  'deleted',
  'unauthorized',
  'blocked_account',
  'blocked_domain',
  'muted_account',
]);

type QuoteState = v.InferOutput<typeof quoteStateSchema>;

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/Quote/}
 */
const quoteSchema = v.object({
  state: v.fallback(quoteStateSchema, 'accepted'),
  quoted_status: v.fallback(v.nullable(v.lazy(() => statusSchema)), null),
});

/**
 * @category Entity types
 */
interface Quote {
  state: v.InferOutput<typeof quoteStateSchema>;
  quoted_status: Status | null;
}

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/ShallowQuote/}
 */
const shallowQuoteSchema = v.object({
  state: v.fallback(quoteStateSchema, 'accepted'),
  quoted_status_id: v.fallback(v.nullable(v.string()), null),
});

/**
 * @category Entity types
 */
type ShallowQuote = v.InferOutput<typeof shallowQuoteSchema>;

export { quoteSchema, shallowQuoteSchema, type QuoteState, type Quote, type ShallowQuote };
