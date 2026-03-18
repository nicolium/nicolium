import { staticFetch } from '@/api';
import { getAuthUserUrl, getMeUrl, getClient } from '@/stores/auth';
import { useComposeStore } from '@/stores/compose';
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

const doFetchInstance = async () => {
  const client = getClient();
  const instance = await client.instance.getInstance();

  useInstanceStore.getState().actions.loadInstance(instance);
  useComposeStore.getState().actions.importDefaultContentType(instance);
};

const fetchInstance = async () => {
  const { fetched, instanceFetchFailed } = useInstanceStore.getState();
  if (fetched || (instanceFetchFailed && !getAuthUserUrl())) return;

  const promise = doFetchInstance().catch((error) => {
    useInstanceStore.getState().actions.instanceFetchFailed(error);
  });

  if (!fetched) await promise;
};

const checkIfStandalone = () =>
  staticFetch('/api/v1/instance', { method: 'GET' })
    .then(({ ok, headers }) => {
      const isOk = ok && !!headers.get('content-type')?.includes('application/json');
      useInstanceStore.getState().actions.setInstanceFetchFailed(!isOk);
      return !isOk;
    })
    .catch((err) => {
      useInstanceStore.getState().actions.setInstanceFetchFailed(!err.response?.ok);
      return true;
    });

export { getHost, fetchInstance, checkIfStandalone };
