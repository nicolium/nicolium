import { createSelector } from 'reselect';
import * as v from 'valibot';

import { getHost } from '@/actions/instance';
import { plFeConfigSchema } from '@/normalizers/pl-fe/pl-fe-config';
import KVStore from '@/storage/kv-store';
import { useSettingsStore } from '@/stores/settings';

import { getClient, staticFetch } from '../api';

import type { AppDispatch, RootState } from '@/store';
import type { APIEntity } from '@/types/entities';

const PLFE_CONFIG_REQUEST_SUCCESS = 'PLFE_CONFIG_REQUEST_SUCCESS' as const;
const PLFE_CONFIG_REQUEST_FAIL = 'PLFE_CONFIG_REQUEST_FAIL' as const;

const PLFE_CONFIG_REMEMBER_SUCCESS = 'PLFE_CONFIG_REMEMBER_SUCCESS' as const;

const getPlFeConfig = createSelector([
  (state: RootState) => state.plfe,
// Do some additional normalization with the state
], (plfe) => v.parse(plFeConfigSchema, plfe));

const rememberPlFeConfig = (host: string | null) =>
  (dispatch: AppDispatch) =>
    KVStore.getItemOrError(`plfe_config:${host}`).then(plFeConfig => {
      dispatch({ type: PLFE_CONFIG_REMEMBER_SUCCESS, host, plFeConfig });
      return true;
    }).catch(() => false);

const fetchFrontendConfigurations = () =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).instance.getFrontendConfigurations();

/** Conditionally fetches pl-fe config depending on backend features */
const fetchPlFeConfig = (host: string | null) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const features = getState().auth.client.features;

    if (features.frontendConfigurations) {
      return dispatch(fetchFrontendConfigurations()).then(data => {
        const key = 'pl_fe';
        if (data[key]) {
          dispatch(importPlFeConfig(data[key], host));
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
const loadPlFeConfig = () =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const host = getHost(getState());

    const result = await dispatch(rememberPlFeConfig(host));

    if (result) {
      dispatch(fetchPlFeConfig(host));
      return;
    } else {
      return dispatch(fetchPlFeConfig(host));
    }
  };

const fetchPlFeJson = (host: string | null) =>
  (dispatch: AppDispatch) =>
    staticFetch('/instance/pl-fe.json').then(({ json: data }) => {
      if (!isObject(data)) throw 'pl-fe.json failed';
      dispatch(importPlFeConfig(data, host));
      return data;
    }).catch(error => {
      dispatch(plFeConfigFail(error, host));
    });

const importPlFeConfig = (plFeConfig: APIEntity, host: string | null) => {
  if (!plFeConfig.brandColor) {
    plFeConfig.brandColor = '#d80482';
  }

  useSettingsStore.getState().actions.loadDefaultSettings(plFeConfig?.defaultSettings);

  return {
    type: PLFE_CONFIG_REQUEST_SUCCESS,
    plFeConfig,
    host,
  };
};

const plFeConfigFail = (error: unknown, host: string | null) => ({
  type: PLFE_CONFIG_REQUEST_FAIL,
  error,
  skipAlert: true,
  host,
});

// https://stackoverflow.com/a/46663081
const isObject = (o: any) => o instanceof Object && o.constructor === Object;

export {
  PLFE_CONFIG_REQUEST_SUCCESS,
  PLFE_CONFIG_REQUEST_FAIL,
  PLFE_CONFIG_REMEMBER_SUCCESS,
  getPlFeConfig,
  fetchPlFeConfig,
  loadPlFeConfig,
};
