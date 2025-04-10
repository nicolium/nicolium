import * as v from 'valibot';

import { datetimeSchema } from './utils';

/**
 * @category Schemas
 */
const subscriptionInvoiceSchema = v.object({
  /** Invoice ID. */
  invoice_id: v.string(),
  /** The ID of the sender. */
  sender_id: v.string(),
  /** The ID of the recipient. */
  recipient_id: v.string(),
  /** CAIP-2 chain ID. */
  chain_id: v.string(),
  /** Payment address. */
  payment_address: v.string(),
  /** Requested payment amount (in atomic units). */
  amount: v.number(),
  /** Invoice status. */
  status: v.picklist(['open', 'paid', 'forwarded', 'timeout', 'cancelled', 'underpaid', 'completed', 'failed']),
  /** The date when invoice was created. */
  created_at: v.fallback(datetimeSchema, new Date().toISOString()),
  /** The date when invoice times out. */
  invoice_expires_at: v.fallback(datetimeSchema, new Date().toISOString()),
});

/**
 * @category Entity types
 */
type SubscriptionInvoice = v.InferOutput<typeof subscriptionInvoiceSchema>;

export {
  subscriptionInvoiceSchema,
  type SubscriptionInvoice,
};
