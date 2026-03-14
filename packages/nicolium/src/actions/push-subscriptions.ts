import { useAuthStore } from '@/stores/auth';

import type { CreatePushNotificationsSubscriptionParams } from 'pl-api';

const createPushSubscription = (params: CreatePushNotificationsSubscriptionParams) =>
  useAuthStore.getState().client.pushNotifications.createSubscription(params);

export { createPushSubscription };
