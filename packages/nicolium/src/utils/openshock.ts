import { useSettingsStore } from '@/stores/settings';
import { buildFullPath } from '@/utils/url';

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

const getBaseUrlAndToken = () => {
  const settings = useSettingsStore.getState().settings.openshock;

  return {
    baseUrl: settings?.baseUrl || '',
    token: settings?.token || '',
    defaultDevice: settings?.defaultDevice || '',
  };
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
  });
};

const getDeviceList = (): Promise<DevicesResponse> => {
  const { baseUrl, token } = getBaseUrlAndToken();

  return fetch(buildFullPath(`/1/shockers/own`, baseUrl), {
    headers: {
      'Content-Type': 'application/json',
      OpenShockToken: token,
    },
  }).then((res) => res.json());
};

const checkToken = (baseUrl: string, token: string) =>
  fetch(buildFullPath(`/2/tokens/self`, baseUrl), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      OpenShockToken: token,
    },
  }).then((res) => res.ok);

export { sendControlMessage, getDeviceList, checkToken, type DevicesResponse };
