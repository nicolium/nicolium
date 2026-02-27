/**
 * State: general Redux state utility functions.
 * @module @/utils/state
 */

import * as BuildConfig from '@/build-config';
import { isPrerendered } from '@/precheck';
import { selectOwnAccount } from '@/queries/accounts/selectors';
import { isURL } from '@/utils/auth';

import type { RootState } from '@/store';

/** Whether to display the fqn instead of the acct. */
const displayFqn = (state: RootState): boolean => state.frontendConfig.displayFqn ?? true;

/** Whether the instance exposes instance blocks through the API. */
const federationRestrictionsDisclosed = (state: RootState): boolean =>
  !!state.instance.pleroma.metadata.federation.mrf_policies;

/**
 * Determine whether Nicolium is running in standalone mode.
 * Standalone mode runs separately from any backend and can login anywhere.
 */
const isStandalone = (state: RootState): boolean => {
  const instanceFetchFailed = state.meta.instance_fetch_failed;
  return isURL(BuildConfig.BACKEND_URL) ? false : !isPrerendered && instanceFetchFailed;
};

const getHost = (url: string = ''): string => {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
};

/** Get the baseURL of the instance. */
const getBaseURL = (state: RootState): string => {
  const account = selectOwnAccount(state);
  return isURL(BuildConfig.BACKEND_URL) ? BuildConfig.BACKEND_URL : getHost(account?.url);
};

export { displayFqn, federationRestrictionsDisclosed, isStandalone, getBaseURL };
