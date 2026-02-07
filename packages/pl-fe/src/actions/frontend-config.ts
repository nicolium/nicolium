import { createSelector } from 'reselect';
import * as v from 'valibot';

import { getHost } from '@/actions/instance';
import { frontendConfigSchema } from '@/normalizers/frontend-config';
import KVStore from '@/storage/kv-store';
import { useSettingsStore } from '@/stores/settings';

import { getClient, staticFetch } from '../api';

import type { AppDispatch, RootState } from '@/store';
import type { APIEntity } from '@/types/entities';

const FRONTEND_CONFIG_REQUEST_SUCCESS = 'FRONTEND_CONFIG_REQUEST_SUCCESS' as const;
const FRONTEND_CONFIG_REQUEST_FAIL = 'FRONTEND_CONFIG_REQUEST_FAIL' as const;

const FRONTEND_CONFIG_REMEMBER_SUCCESS = 'FRONTEND_CONFIG_REMEMBER_SUCCESS' as const;

const getFrontendConfig = createSelector([
  (state: RootState) => state.frontendConfig,
// Do some additional normalization with the state
], (frontendConfig) => v.parse(frontendConfigSchema, frontendConfig));

const rememberFrontendConfig = (host: string | null) =>
  (dispatch: AppDispatch) =>
    KVStore.getItemOrError(`plfe_config:${host}`).then(frontendConfig => {
      dispatch({ type: FRONTEND_CONFIG_REMEMBER_SUCCESS, host, frontendConfig });
      return true;
    }).catch(() => false);

const fetchFrontendConfigurations = () =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).instance.getFrontendConfigurations();

/** Conditionally fetches pl-fe config depending on backend features */
const fetchFrontendConfig = (host: string | null) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const features = getState().auth.client.features;

    if (features.frontendConfigurations) {
      return dispatch(fetchFrontendConfigurations()).then(data => {
        const key = 'pl_fe';
        if (data[key]) {
          dispatch(importFrontendConfig(data[key], host));
          return data[key];
        } else {
          return dispatch(fetchPlFeJson(host));
        }
      });
    } else {
      return dispatch(fetchPlFeJson(host));
    }
  };

/** Tries to remember the config from browser storage before fetching it */
const loadFrontendConfig = () =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const host = getHost(getState());

    const result = await dispatch(rememberFrontendConfig(host));

    if (result) {
      dispatch(fetchFrontendConfig(host));
      return;
    } else {
      return dispatch(fetchFrontendConfig(host));
    }
  };

const fetchPlFeJson = (host: string | null) =>
  (dispatch: AppDispatch) =>
    staticFetch('/instance/pl-fe.json').then(({ json: data }) => {
      if (!isObject(data)) throw 'pl-fe.json failed';
      dispatch(importFrontendConfig(data, host));
      return data;
    }).catch(error => {
      dispatch(frontendConfigFail(error, host));
    });

const importFrontendConfig = (frontendConfig: APIEntity, host: string | null) => {
  if (!frontendConfig.brandColor) {
    frontendConfig.brandColor = '#d80482';
  }

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

export {
  FRONTEND_CONFIG_REQUEST_SUCCESS,
  FRONTEND_CONFIG_REQUEST_FAIL,
  FRONTEND_CONFIG_REMEMBER_SUCCESS,
  getFrontendConfig,
  fetchFrontendConfig,
  loadFrontendConfig,
};
