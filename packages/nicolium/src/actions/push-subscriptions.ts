import { getClient } from '@/api';

import type { AppDispatch, RootState } from '@/store';
import type { CreatePushNotificationsSubscriptionParams } from 'pl-api';

const createPushSubscription =
  (params: CreatePushNotificationsSubscriptionParams) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).pushNotifications.createSubscription(params);

export { createPushSubscription };
