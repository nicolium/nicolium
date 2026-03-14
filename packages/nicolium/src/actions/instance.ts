import { getClient, staticFetch } from '@/api';
import { useComposeStore } from '@/stores/compose';
import { useInstanceStore } from '@/stores/instance';
import { getAuthUserUrl, getMeUrl } from '@/utils/auth';

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
    const instance = await getClient().instance.getInstance();

    useInstanceStore.getState().actions.loadInstance(instance);
    useComposeStore.getState().actions.importDefaultContentType(instance);
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
