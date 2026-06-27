/**
 * State: general state utility functions.
 * @module @/utils/state
 */

import * as BuildConfig from '@/build-config';
import { isPrerendered } from '@/precheck';
import { useInstance, useInstanceStore } from '@/stores/instance';

/**
 * Determine whether Nicolium is running in standalone mode.
 * Standalone mode runs separately from any backend and can login anywhere.
 */
const isStandalone = (): boolean => {
  const instanceFetchFailed = useInstanceStore.getState().instanceFetchFailed;
  return URL.canParse(BuildConfig.BACKEND_URL) ? false : !isPrerendered && instanceFetchFailed;
};

const useIsStandalone = () => {
  const instanceFetchFailed = useInstanceStore((state) => state.instanceFetchFailed);
  return URL.canParse(BuildConfig.BACKEND_URL) ? false : !isPrerendered && instanceFetchFailed;
};

const useFederationRestrictionsDisclosed = () =>
  !!useInstance().pleroma.metadata.federation.mrf_policies;

export { isStandalone, useIsStandalone, useFederationRestrictionsDisclosed };
