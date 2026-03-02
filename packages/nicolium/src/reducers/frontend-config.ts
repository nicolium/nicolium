import * as v from 'valibot';

import { ADMIN_CONFIG_UPDATE_SUCCESS, type AdminActions } from '@/actions/admin';
import {
  FRONTEND_CONFIG_REMEMBER_SUCCESS,
  FRONTEND_CONFIG_REQUEST_SUCCESS,
  FRONTEND_CONFIG_REQUEST_FAIL,
  type FrontendConfigAction,
} from '@/actions/frontend-config';
import { PLEROMA_PRELOAD_IMPORT, type PreloadAction } from '@/actions/preload';
import { type PartialFrontendConfig, partialFrontendConfigSchema } from '@/schemas/frontend-config';
import KVStore from '@/storage/kv-store';
import ConfigDB from '@/utils/config-db';

import type { PleromaConfig } from 'pl-api';

const initialState: PartialFrontendConfig = {};

const fallbackState: PartialFrontendConfig = {
  brandColor: '#d80482',
};

const updateFromAdmin = (state: Record<string, any>, configs: PleromaConfig['configs']) => {
  try {
    return ConfigDB.find(configs, ':pleroma', ':frontend_configurations')!.value.find(
      (value: Record<string, any>) => value.tuple?.[0] === ':pl_fe',
    ).tuple?.[1];
  } catch {
    return state;
  }
};

const preloadImport = (state: Record<string, any>, action: Record<string, any>) => {
  const path = '/api/pleroma/frontend_configurations';
  const feData = action.data[path];

  if (feData) {
    const nicoliumConfig = feData.nicolium || feData.pl_fe;
    return nicoliumConfig ? { ...fallbackState, ...nicoliumConfig } : fallbackState;
  } else {
    return state;
  }
};

const persistFrontendConfig = (frontendConfig: PartialFrontendConfig, host: string) => {
  if (host) {
    KVStore.setItem(`plfe_config:${host}`, frontendConfig).catch(console.error);
  }
};

const importFrontendConfig = (frontendConfig: unknown, host: string) => {
  const parsedFrontendConfig = v.parse(partialFrontendConfigSchema, frontendConfig);
  persistFrontendConfig(parsedFrontendConfig, host);
  return parsedFrontendConfig;
};

const parseFrontendConfig = (frontendConfig: unknown) => {
  try {
    return v.parse(partialFrontendConfigSchema, frontendConfig);
  } catch (e) {
    console.error('Failed to parse frontend config', e);
    return null;
  }
};

const frontendConfig = (
  state = initialState,
  action: PreloadAction | FrontendConfigAction | AdminActions,
): PartialFrontendConfig => {
  switch (action.type) {
    case PLEROMA_PRELOAD_IMPORT:
      return parseFrontendConfig(preloadImport(state, action)) || state;
    case FRONTEND_CONFIG_REMEMBER_SUCCESS:
      return parseFrontendConfig(action.frontendConfig) || state;
    case FRONTEND_CONFIG_REQUEST_SUCCESS:
      return importFrontendConfig(action.frontendConfig ?? {}, action.host || '') || state;
    case FRONTEND_CONFIG_REQUEST_FAIL:
      return { ...fallbackState, ...state };
    case ADMIN_CONFIG_UPDATE_SUCCESS:
      return parseFrontendConfig(updateFromAdmin(state, action.configs ?? [])) || state;
    default:
      return state;
  }
};

export { frontendConfig as default };
