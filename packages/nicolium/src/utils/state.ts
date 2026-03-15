/**
 * State: general state utility functions.
 * @module @/utils/state
 */

import * as BuildConfig from '@/build-config';
import { isPrerendered } from '@/precheck';
import { useInstanceStore } from '@/stores/instance';
import { isURL } from '@/utils/auth';

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

export { isStandalone, useIsStandalone, useFederationRestrictionsDisclosed };
