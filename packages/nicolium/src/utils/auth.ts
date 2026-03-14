import { selectAccount, selectOwnAccount } from '@/queries/accounts/selectors';
import { useAuthStore } from '@/stores/auth';
import { useInstanceStore } from '@/stores/instance';

const validId = (id?: string | null | false) =>
  typeof id === 'string' && id !== 'null' && id !== 'undefined';

const isURL = (url?: string | null) => {
  if (typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const parseBaseURL = (url?: string) => {
  if (typeof url !== 'string') return '';
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
};

const getLoggedInAccount = () => selectOwnAccount();

const isLoggedIn = () => validId(useAuthStore.getState().currentAccountId);

const getUserToken = (accountId?: string | false | null) => {
  if (!accountId) return;
  const accountUrl = selectAccount(accountId)?.url;
  if (!accountUrl) return;
  return useAuthStore.getState().users[accountUrl]?.access_token;
};

const getAccessToken = () => {
  const { currentAccountId } = useAuthStore.getState();
  return getUserToken(currentAccountId);
};

const getAuthUserId = () => {
  const { me, users } = useAuthStore.getState();
  return [users[me!]?.id, me].filter((id) => id).find(validId);
};

const getAuthUserUrl = () => {
  const { me, users } = useAuthStore.getState();
  return [users[me!]?.url, me].filter((url) => url).find(isURL);
};

/** Get the VAPID public key. */
const getVapidKey = () =>
  useAuthStore.getState().app?.vapid_key ??
  useInstanceStore.getState().instance.configuration.vapid.public_key;

const getMeUrl = () => selectOwnAccount()?.url;

export {
  validId,
  isURL,
  parseBaseURL,
  getLoggedInAccount,
  isLoggedIn,
  getAccessToken,
  getAuthUserId,
  getAuthUserUrl,
  getVapidKey,
  getMeUrl,
};
