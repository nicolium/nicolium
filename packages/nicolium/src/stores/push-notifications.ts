import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

import type { WebPushSubscription } from 'pl-api';

interface Subscription {
  id: string;
  endpoint: string;
}

interface PushNotificationState {
  subscription: Subscription | null;
  alerts: Record<string, boolean>;
  isSubscribed: boolean;
  actions: {
    setSubscription: (subscription: WebPushSubscription) => void;
    clearSubscription: () => void;
  };
}

const usePushNotificationsStore = create<PushNotificationState>()(
  mutative((set) => ({
    subscription: null,
    alerts: {
      follow: true,
      follow_request: true,
      favourite: true,
      reblog: true,
      mention: true,
      poll: true,
      status: true,
    },
    isSubscribed: false,

    actions: {
      setSubscription: (subscription) => {
        set((state) => {
          state.subscription = {
            id: subscription.id,
            endpoint: subscription.endpoint,
          };
          state.alerts = subscription.alerts;
          state.isSubscribed = true;
        });
      },
      clearSubscription: () => {
        set({
          subscription: null,
          alerts: {
            follow: true,
            follow_request: true,
            favourite: true,
            reblog: true,
            mention: true,
            poll: true,
            status: true,
          },
          isSubscribed: false,
        });
      },
    },
  })),
);

export { usePushNotificationsStore };
