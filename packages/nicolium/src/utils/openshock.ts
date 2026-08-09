import { defineMessages } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import { useSettingsStore } from '@/stores/settings';
import toast from '@/toast';
import { buildFullPath } from '@/utils/url';

const messages = defineMessages({
  requestFailedRevoking: {
    id: 'integrations.openshock.request_fail',
    defaultMessage:
      'Request to OpenShock failed. Connection has been disabled. Visit integrations settings to re-enable it.',
  },
  requestFailedRevokingView: {
    id: 'integrations.openshock.request_fail.view',
    defaultMessage: 'View settings',
  },
});

type DevicesResponse = {
  message: string;
  data: Array<{
    id: string;
    name: string;
    createdOn: string;
    shockers: Array<{
      name: string;
      notPaused: boolean;
      createdOn: string;
      id: string;
      rfId: string;
      model: string;
    }>;
  }>;
};

// i made it stateless because i was tired of how the url purify thing behaved lol
const getBaseUrlAndToken = () => {
  const settings = useSettingsStore.getState().settings.openshock;

  return {
    baseUrl: settings?.baseUrl || '',
    token: settings?.token || '',
    defaultDevice: settings?.defaultDevice || '',
  };
};

const handleOpenshockError = (response: Response) => {
  if (response.status === 401) {
    toast.error(messages.requestFailedRevoking, {
      actionLabel: messages.requestFailedRevokingView,
      actionLinkOptions: {
        href: '/settings/integrations/openshock',
      },
    });

    changeSetting(['openshock'], (openshock: any) => ({
      ...openshock,
      baseUrl: '',
      token: '',
      defaultDevice: '',
    }));
  }
  return response.json();
};

const sendControlMessage = (
  type: 'Shock' | 'Vibrate' | 'Sound',
  intensity: number,
  duration: number,
  message?: string,
) => {
  const { baseUrl, token, defaultDevice } = getBaseUrlAndToken();

  return fetch(buildFullPath(`/2/shockers/control`, baseUrl), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      OpenShockToken: token,
    },
    body: JSON.stringify({
      shocks: [
        {
          id: defaultDevice,
          type,
          intensity,
          duration,
          exclusive: true,
        },
      ],
      customName: message,
    }),
  }).then(handleOpenshockError);
};

const getDeviceList = (): Promise<DevicesResponse> => {
  const { baseUrl, token } = getBaseUrlAndToken();

  return fetch(buildFullPath(`/1/shockers/own`, baseUrl), {
    headers: {
      'Content-Type': 'application/json',
      OpenShockToken: token,
    },
  }).then(handleOpenshockError);
};

const checkToken = async (baseUrl: string, token: string) => {
  const response = await fetch(buildFullPath(`/2/tokens/self`, baseUrl), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      OpenShockToken: token,
    },
  });

  if (response.ok) return true;

  if (response.status === 401) return 'invalid';

  return false;
};

export { sendControlMessage, getDeviceList, checkToken, type DevicesResponse };
