/**
 * State: general state utility functions.
 * @module @/utils/state
 */

import * as BuildConfig from '@/build-config';
import { isPrerendered } from '@/precheck';
import { selectOwnAccount } from '@/queries/accounts/selectors';
import { useFrontendConfigStore } from '@/stores/frontend-config';
import { useInstanceStore } from '@/stores/instance';
import { isURL } from '@/utils/auth';

/** Whether to display the fqn instead of the acct. */
const displayFqn = (): boolean =>
  useFrontendConfigStore.getState().partialConfig.displayFqn ?? true;

/** Whether the instance exposes instance blocks through the API. */
const federationRestrictionsDisclosed = (): boolean =>
  !!useInstanceStore.getState().instance.pleroma.metadata.federation.mrf_policies;

/**
 * Determine whether Nicolium is running in standalone mode.
 * Standalone mode runs separately from any backend and can login anywhere.
 */
const isStandalone = (): boolean => {
  const instanceFetchFailed = useInstanceStore.getState().instanceFetchFailed;
  return isURL(BuildConfig.BACKEND_URL) ? false : !isPrerendered && instanceFetchFailed;
};

const useIsStandalone = () => {
  const instanceFetchFailed = useInstanceStore((state) => state.instanceFetchFailed);
  return isURL(BuildConfig.BACKEND_URL) ? false : !isPrerendered && instanceFetchFailed;
};

const useFederationRestrictionsDisclosed = () =>
  useInstanceStore((state) => !!state.instance.pleroma.metadata.federation.mrf_policies);

const getHost = (url: string = ''): string => {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
};

/** Get the baseURL of the instance. */
const getBaseURL = (): string => {
  const account = selectOwnAccount();
  return isURL(BuildConfig.BACKEND_URL) ? BuildConfig.BACKEND_URL : getHost(account?.url);
};

export {
  displayFqn,
  federationRestrictionsDisclosed,
  isStandalone,
  useIsStandalone,
  useFederationRestrictionsDisclosed,
  getBaseURL,
};
