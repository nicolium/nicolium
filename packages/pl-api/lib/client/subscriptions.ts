import * as v from 'valibot';

import {
  accountSchema,
  subscriptionDetailsSchema,
  subscriptionInvoiceSchema,
  subscriptionOptionSchema,
} from '../entities';
import { filteredArray } from '../entities/utils';

import type { PlApiBaseClient } from '../client-base';

const subscriptions = (client: PlApiBaseClient) => ({
  /**
   * Add subscriber or extend existing subscription. Can be used if blockchain integration is not enabled.
   *
   * Requires features{@link Features.subscriptions}.
   * @param subscriberId - The subscriber ID.
   * @param duration - The subscription duration (in seconds).
   */
  createSubscription: async (subscriberId: string, duration: number) => {
    const response = await client.request('/api/v1/subscriptions', {
      method: 'POST',
      body: { subscriber_id: subscriberId, duration },
    });

    return v.parse(subscriptionDetailsSchema, response.json);
  },

  /**
   * Get list of subscription options
   *
   * Requires features{@link Features.subscriptions}.
   */
  getSubscriptionOptions: async () => {
    const response = await client.request('/api/v1/subscriptions/options');

    return v.parse(filteredArray(subscriptionOptionSchema), response.json);
  },

  /**
   * Enable subscriptions or update subscription settings
   *
   * Requires features{@link Features.subscriptions}.
   * @param type - Subscription type
   * @param chainId - CAIP-2 chain ID.
   * @param price - Subscription price (only for Monero)
   * @param payoutAddress - Payout address (only for Monero)
   */
  updateSubscription: async (
    type: 'monero',
    chainId?: string,
    price?: number,
    payoutAddress?: string,
  ) => {
    const response = await client.request('/api/v1/subscriptions/options', {
      method: 'POST',
      body: { type, chain_id: chainId, price, payout_address: payoutAddress },
    });

    return v.parse(accountSchema, response.json);
  },

  /**
   * Find subscription by sender and recipient
   *
   * Requires features{@link Features.subscriptions}.
   * @param senderId - Sender ID.
   * @param recipientId - Recipient ID.
   */
  findSubscription: async (senderId: string, recipientId: string) => {
    const response = await client.request('/api/v1/subscriptions/find', {
      params: { sender_id: senderId, recipient_id: recipientId },
    });

    return v.parse(subscriptionDetailsSchema, response.json);
  },

  /**
   * Create invoice
   *
   * Requires features{@link Features.subscriptions}.
   * @param senderId - Sender ID.
   * @param recipientId - Recipient ID.
   * @param chainId - CAIP-2 chain ID.
   * @param amount - Requested payment amount (in atomic units).
   */
  createInvoice: async (senderId: string, recipientId: string, chainId: string, amount: number) => {
    const response = await client.request('/api/v1/subscriptions/invoices', {
      method: 'POST',
      body: {
        sender_id: senderId,
        recipient_id: recipientId,
        chain_id: chainId,
        amount,
      },
    });

    return v.parse(subscriptionInvoiceSchema, response.json);
  },

  /**
   * View information about an invoice.
   *
   * Requires features{@link Features.invoices}.
   * @param invoiceId - Invoice ID
   */
  getInvoice: async (invoiceId: string) => {
    const response = await client.request(`/api/v1/subscriptions/invoices/${invoiceId}`);

    return v.parse(subscriptionInvoiceSchema, response.json);
  },

  /**
   * Cancel invoice.
   *
   * Requires features{@link Features.invoices}.
   * @param invoiceId - Invoice ID
   */
  cancelInvoice: async (invoiceId: string) => {
    const response = await client.request(`/api/v1/subscriptions/invoices/${invoiceId}`, {
      method: 'DELETE',
    });

    return v.parse(subscriptionInvoiceSchema, response.json);
  },
});

export { subscriptions };
