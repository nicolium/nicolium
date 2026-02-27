import { getFeatures, HOLLO, ICESHRIMP_NET, PLEROMA, TOKI, type Instance } from 'pl-api';

import type { RootState } from '@/store';

/**
 * Get the OAuth scopes to use for login & signup.
 * Mastodon will refuse scopes it doesn't know, so care is needed.
 */
const getInstanceScopes = (
  instance: Instance,
  admin: boolean = true,
  external: boolean = false,
) => {
  const v = getFeatures(instance).version;

  let scopes;

  switch (v.software) {
    case TOKI:
      scopes = 'read write follow push write:bites';
      break;
    default:
      scopes = 'read write follow push';
  }

  if (admin) {
    switch (v.software) {
      case HOLLO:
      case ICESHRIMP_NET:
        break;
      case PLEROMA:
        scopes += ' admin';
        break;
      default:
        scopes += ' admin:read admin:write';
    }
  }

  if (v.software === ICESHRIMP_NET && !external) {
    scopes += ' iceshrimp';
  }

  return scopes;
};

/** Convenience function to get scopes from instance in store. */
const getScopes = (state: RootState, admin?: boolean, external?: boolean) =>
  getInstanceScopes(state.instance, admin, external);

export { getInstanceScopes, getScopes };
