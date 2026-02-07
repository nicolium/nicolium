import { PLEROMA_PRELOAD_IMPORT } from '@/actions/preload';
import KVStore from '@/storage/kv-store';
import ConfigDB from '@/utils/config-db';

import { ADMIN_CONFIG_UPDATE_SUCCESS } from '../actions/admin';
import {
  FRONTEND_CONFIG_REMEMBER_SUCCESS,
  FRONTEND_CONFIG_REQUEST_SUCCESS,
  FRONTEND_CONFIG_REQUEST_FAIL,
} from '../actions/frontend-config';

import type { FrontendConfig } from '@/normalizers/frontend-config';
import type { PleromaConfig } from 'pl-api';

const initialState: Partial<FrontendConfig> = {};

const fallbackState: Partial<FrontendConfig> = {
  brandColor: '#d80482',
};

const updateFromAdmin = (state: Record<string, any>, configs: PleromaConfig['configs']) => {
  try {
    return ConfigDB.find(configs, ':pleroma', ':frontend_configurations')!
      .value
      .find((value: Record<string, any>) => value.tuple?.[0] === ':pl_fe')
      .tuple?.[1];
  } catch {
    return state;
  }
};

const preloadImport = (state: Record<string, any>, action: Record<string, any>) => {
  const path = '/api/pleroma/frontend_configurations';
  const feData = action.data[path];

  if (feData) {
    const plfe = feData.pl_fe;
    return plfe ? { ...fallbackState, ...plfe } : fallbackState;
  } else {
    return state;
  }
};

const persistFrontendConfig = (frontendConfig: Record<string, any>, host: string) => {
  if (host) {
    KVStore.setItem(`plfe_config:${host}`, frontendConfig).catch(console.error);
  }
};

const importFrontendConfig = (frontendConfig: FrontendConfig, host: string) => {
  persistFrontendConfig(frontendConfig, host);
  return frontendConfig;
};

const frontendConfig = (state = initialState, action: Record<string, any>): Partial<FrontendConfig> => {
  switch (action.type) {
    case PLEROMA_PRELOAD_IMPORT:
      return preloadImport(state, action);
    case FRONTEND_CONFIG_REMEMBER_SUCCESS:
      return action.frontendConfig;
    case FRONTEND_CONFIG_REQUEST_SUCCESS:
      return importFrontendConfig(action.frontendConfig || {}, action.host);
    case FRONTEND_CONFIG_REQUEST_FAIL:
      return { ...fallbackState, ...state };
    case ADMIN_CONFIG_UPDATE_SUCCESS:
      return updateFromAdmin(state, action.configs || []);
    default:
      return state;
  }
};

export { frontendConfig as default };
