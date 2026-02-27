import * as v from 'valibot';

import { webPushSubscriptionSchema } from '@/entities';

import type { PlApiBaseClient } from '@/client-base';
import type {
  CreatePushNotificationsSubscriptionParams,
  UpdatePushNotificationsSubscriptionParams,
} from '@/params/push-notifications';
import type { EmptyObject } from '@/utils/types';

const pushNotifications = (client: PlApiBaseClient) => ({
  /**
   * Subscribe to push notifications
   * Add a Web Push API subscription to receive notifications. Each access token can have one push subscription. If you create a new subscription, the old subscription is deleted.
   * @see {@link https://docs.joinmastodon.org/methods/push/#create}
   */
  createSubscription: async (params: CreatePushNotificationsSubscriptionParams) => {
    const response = await client.request('/api/v1/push/subscription', {
      method: 'POST',
      body: params,
    });

    return v.parse(webPushSubscriptionSchema, response.json);
  },

  /**
   * Get current subscription
   * View the PushSubscription currently associated with this access token.
   * @see {@link https://docs.joinmastodon.org/methods/push/#get}
   */
  getSubscription: async () => {
    const response = await client.request('/api/v1/push/subscription');

    return v.parse(webPushSubscriptionSchema, response.json);
  },

  /**
   * Change types of notifications
   * Updates the current push subscription. Only the data part can be updated. To change fundamentals, a new subscription must be created instead.
   * @see {@link https://docs.joinmastodon.org/methods/push/#update}
   */
  updateSubscription: async (params: UpdatePushNotificationsSubscriptionParams) => {
    const response = await client.request('/api/v1/push/subscription', {
      method: 'PUT',
      body: params,
    });

    return v.parse(webPushSubscriptionSchema, response.json);
  },

  /**
   * Remove current subscription
   * Removes the current Web Push API subscription.
   * @see {@link https://docs.joinmastodon.org/methods/push/#delete}
   */
  deleteSubscription: async () => {
    const response = await client.request<EmptyObject>('/api/v1/push/subscription', {
      method: 'DELETE',
    });

    return response.json;
  },
});

export { pushNotifications };
