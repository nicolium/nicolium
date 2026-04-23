import type { CreatePushNotificationsSubscriptionParams, PlApiClient } from 'pl-api';

const createPushSubscription = (
  client: PlApiClient,
  params: CreatePushNotificationsSubscriptionParams,
) => client.pushNotifications.createSubscription(params);

export { createPushSubscription };
