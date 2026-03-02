import { getHost } from '@/actions/instance';
import { getClient, staticFetch } from '@/api';
import KVStore from '@/storage/kv-store';
import { useSettingsStore } from '@/stores/settings';

import type { AppDispatch, RootState } from '@/store';
import type { APIEntity } from '@/types/entities';

const FRONTEND_CONFIG_REQUEST_SUCCESS = 'FRONTEND_CONFIG_REQUEST_SUCCESS' as const;
const FRONTEND_CONFIG_REQUEST_FAIL = 'FRONTEND_CONFIG_REQUEST_FAIL' as const;

const FRONTEND_CONFIG_REMEMBER_SUCCESS = 'FRONTEND_CONFIG_REMEMBER_SUCCESS' as const;

const rememberFrontendConfig = (host: string | null) => (dispatch: AppDispatch) =>
  KVStore.getItemOrError(`frontendConfig:${host}`)
    .then((frontendConfig) => {
      dispatch<FrontendConfigAction>({
        type: FRONTEND_CONFIG_REMEMBER_SUCCESS,
        host,
        frontendConfig,
      });
      return true;
    })
    .catch(() => false);

const fetchFrontendConfigurations = () => (dispatch: AppDispatch, getState: () => RootState) =>
  getClient(getState).instance.getFrontendConfigurations();

/** Conditionally fetches Nicolium config depending on backend features */
const fetchFrontendConfig =
  (host: string | null) => (dispatch: AppDispatch, getState: () => RootState) => {
    const features = getState().auth.client.features;

    if (features.frontendConfigurations) {
      return dispatch(fetchFrontendConfigurations()).then((data) => {
        const legacyKey = 'pl_fe';
        const key = 'nicolium';

        const foundData = data[key] || data[legacyKey];

        if (foundData) {
          dispatch(importFrontendConfig(foundData, host));
          return foundData;
        } else {
          return dispatch(fetchFrontendConfigJson(host));
        }
      });
    } else {
      return dispatch(fetchFrontendConfigJson(host));
    }
  };

/** Tries to remember the config from browser storage before fetching it */
const loadFrontendConfig = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  const host = getHost(getState());

  const result = await dispatch(rememberFrontendConfig(host));

  if (result) {
    dispatch(fetchFrontendConfig(host));
    return;
  } else {
    return dispatch(fetchFrontendConfig(host));
  }
};

const fetchFrontendConfigJson = (host: string | null) => (dispatch: AppDispatch) =>
  staticFetch('/instance/nicolium.json')
    .then(({ json: data }) => {
      if (!isObject(data)) throw 'nicolium.json fetch failed';
      dispatch(importFrontendConfig(data, host));
      return data;
    })
    .catch((error) => {
      dispatch(frontendConfigFail(error, host));
    });

const importFrontendConfig = (frontendConfig: APIEntity, host: string | null) => {
  frontendConfig.brandColor ??= '#d80482';

  useSettingsStore.getState().actions.loadDefaultSettings(frontendConfig?.defaultSettings);

  return {
    type: FRONTEND_CONFIG_REQUEST_SUCCESS,
    frontendConfig,
    host,
  };
};

const frontendConfigFail = (error: unknown, host: string | null) => ({
  type: FRONTEND_CONFIG_REQUEST_FAIL,
  error,
  skipAlert: true,
  host,
});

// https://stackoverflow.com/a/46663081
const isObject = (o: any) => o instanceof Object && o.constructor === Object;

type FrontendConfigAction =
  | ReturnType<typeof importFrontendConfig>
  | ReturnType<typeof frontendConfigFail>
  | {
      type: typeof FRONTEND_CONFIG_REMEMBER_SUCCESS;
      frontendConfig: APIEntity;
      host: string | null;
    };

export {
  FRONTEND_CONFIG_REQUEST_SUCCESS,
  FRONTEND_CONFIG_REQUEST_FAIL,
  FRONTEND_CONFIG_REMEMBER_SUCCESS,
  fetchFrontendConfig,
  loadFrontendConfig,
  type FrontendConfigAction,
};
