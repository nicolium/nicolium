import { staticFetch } from '@/api';
import { getAuthUserUrl, getMeUrl, getClient } from '@/stores/auth';
import { useInstanceStore } from '@/stores/instance';

/** Figure out the appropriate instance to fetch depending on the state */
const getHost = () => {
  const accountUrl = getMeUrl() ?? (getAuthUserUrl() as string);

  try {
    return new URL(accountUrl).host;
  } catch {
    return null;
  }
};

const fetchInstance = async () => {
  try {
    const client = getClient();
    const instance = await client.instance.getInstance();

    useInstanceStore.getState().actions.loadInstance(instance);
  } catch (error) {
    useInstanceStore.getState().actions.instanceFetchFailed(error);
  }
};

const checkIfStandalone = () =>
  staticFetch('/api/v1/instance', { method: 'GET' })
    .then(({ ok, headers }) => {
      const isOk = ok && !!headers.get('content-type')?.includes('application/json');
      useInstanceStore.getState().actions.setInstanceFetchFailed(!isOk);
    })
    .catch((err) => {
      useInstanceStore.getState().actions.setInstanceFetchFailed(!err.response?.ok);
    });

export { getHost, fetchInstance, checkIfStandalone };
