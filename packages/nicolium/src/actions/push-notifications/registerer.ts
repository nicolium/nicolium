import { createPushSubscription } from '@/actions/push-subscriptions';
import { pushNotificationsSettings } from '@/settings';
import { useAuthStore, type Me } from '@/stores/auth';
import { usePushNotificationsStore } from '@/stores/push-notifications';
import { getVapidKey } from '@/utils/auth';
import { decode as decodeBase64 } from '@/utils/base64';

// Taken from https://www.npmjs.com/package/web-push
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replaceAll('-', '+').replaceAll('_', '/');

  return decodeBase64(base64);
};

const getRegistration = () => {
  if (navigator.serviceWorker) {
    return navigator.serviceWorker.ready;
  } else {
    throw 'Your browser does not support Service Workers.';
  }
};

const getPushSubscription = (registration: ServiceWorkerRegistration) =>
  registration.pushManager
    .getSubscription()
    .then((subscription) => ({ registration, subscription }));

const subscribe = (registration: ServiceWorkerRegistration) =>
  registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(getVapidKey()),
  });

const unsubscribe = ({
  registration,
  subscription,
}: {
  registration: ServiceWorkerRegistration;
  subscription: PushSubscription | null;
}) =>
  subscription
    ? subscription.unsubscribe().then(() => registration)
    : new Promise<ServiceWorkerRegistration>((r) => {
        r(registration);
      });

const sendSubscriptionToBackend = (subscription: PushSubscription, me: Me) => {
  const alerts = usePushNotificationsStore.getState().alerts;
  const params: { subscription: PushSubscription; data: { alerts: Record<string, boolean> } } = {
    subscription,
    data: { alerts },
  };

  if (me) {
    const data = pushNotificationsSettings.get(me);
    if (data) {
      params.data = data;
    }
  }

  return createPushSubscription(params);
};

// Last one checks for payload support: https://web-push-book.gauntface.com/chapter-06/01-non-standards-browsers/#no-payload
// eslint-disable-next-line compat/compat
const supportsPushNotifications =
  'serviceWorker' in navigator && 'PushManager' in window && 'getKey' in PushSubscription.prototype;

const register = () => {
  const me = useAuthStore.getState().currentAccountId;
  const vapidKey = getVapidKey();

  if (!supportsPushNotifications) {
    console.warn('Your browser does not support Web Push Notifications.');
    return;
  }

  if (!vapidKey) {
    console.error(
      'The VAPID public key is not set. You will not be able to receive Web Push Notifications.',
    );
    return;
  }

  getRegistration()
    .then(getPushSubscription)
    .then(async ({ registration, subscription }) => {
      if (subscription !== null) {
        const currentServerKey = new Uint8Array(
          subscription.options.applicationServerKey!,
        ).toString();
        const subscriptionServerKey = urlBase64ToUint8Array(vapidKey).toString();
        const serverEndpoint = usePushNotificationsStore.getState().subscription?.endpoint;

        if (
          subscriptionServerKey === currentServerKey &&
          subscription.endpoint === serverEndpoint
        ) {
          return subscription;
        } else {
          const swRegistration = await unsubscribe({ registration, subscription });
          const pushSubscription = await subscribe(swRegistration);
          await sendSubscriptionToBackend(pushSubscription, me);
        }
      }

      return subscribe(registration).then((pushSubscription) =>
        sendSubscriptionToBackend(pushSubscription, me),
      );
    })
    .then((subscription) => {
      if (!(subscription instanceof PushSubscription)) {
        usePushNotificationsStore.getState().actions.setSubscription(subscription);
        if (me) {
          pushNotificationsSettings.set(me, { alerts: subscription.alerts });
        }
      }
    })
    .catch((error) => {
      if (error.code === 20 && error.name === 'AbortError') {
        console.warn(
          'Your browser supports Web Push Notifications, but does not seem to implement the VAPID protocol.',
        );
      } else if (error.code === 5 && error.name === 'InvalidCharacterError') {
        console.error('The VAPID public key seems to be invalid:', vapidKey);
      }

      usePushNotificationsStore.getState().actions.clearSubscription();

      if (me) {
        pushNotificationsSettings.remove(me);
      }

      return getRegistration().then(getPushSubscription).then(unsubscribe);
    })
    .catch(console.warn);
};

export { register };
