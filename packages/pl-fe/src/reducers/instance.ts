import { create } from 'mutative';
import { type Instance, instanceSchema, PleromaConfig } from 'pl-api';
import * as v from 'valibot';

import { ADMIN_CONFIG_UPDATE_REQUEST, ADMIN_CONFIG_UPDATE_SUCCESS, type AdminActions } from '@/actions/admin';
import { INSTANCE_FETCH_FAIL, INSTANCE_FETCH_SUCCESS, type InstanceAction } from '@/actions/instance';
import { PLEROMA_PRELOAD_IMPORT, type PreloadAction } from '@/actions/preload';
import KVStore from '@/storage/kv-store';
import ConfigDB from '@/utils/config-db';

const initialState: State = { fetched: false, ...v.parse(instanceSchema, {}) };

type State = Instance & { fetched: boolean };

const preloadImport = (state: State, action: PreloadAction, path: string): State => {
  const instance = action.data[path];
  const parsedInstance = v.safeParse(instanceSchema, instance);

  if (parsedInstance.success) {
    return { fetched: true, ...parsedInstance.output };
  }
  return state;
};

const getConfigValue = (instanceConfig: Array<any>, key: string) => {
  const v = instanceConfig
    .find(value => value?.tuple?.[0] === key);

  return v ? v?.tuple?.[1] : undefined;
};

const importConfigs = (state: State, configs: PleromaConfig['configs']) => {
  // FIXME: This is pretty hacked together. Need to make a cleaner map.
  const config = ConfigDB.find(configs, ':pleroma', ':instance');

  if (!config) return state;

  if (config) {
    const value = config.value ?? [];
    const registrationsOpen = getConfigValue(value, ':registrations_open') as boolean | undefined;
    const approvalRequired = getConfigValue(value, ':account_approval_required') as boolean | undefined;

    state.registrations = {
      ...state.registrations,
      enabled: registrationsOpen ?? state.registrations.enabled,
      approval_required: approvalRequired ?? state.registrations.approval_required,
    };
  }
};

const handleAuthFetch = (state: State) => {
  // Authenticated fetch is enabled, so make the instance appear censored
  return {
    ...state,
    title: state.title || '██████',
    description: state.description || '████████████',
  };
};

const getHost = (instance: { domain: string }) => {
  const domain = instance.domain;
  try {
    return new URL(domain).host;
  } catch {
    try {
      return new URL(`https://${domain}`).host;
    } catch {
      return null;
    }
  }
};

const persistInstance = (instance: { domain: string }, host: string | null = getHost(instance)) => {
  if (host) {
    KVStore.setItem(`instance:${host}`, instance).catch(console.error);
  }
};

const handleInstanceFetchFail = (state: State, error: any) => {
  if (error.response?.status === 401) {
    return handleAuthFetch(state);
  } else {
    return state;
  }
};

const instance = (state = initialState, action: AdminActions | InstanceAction | PreloadAction): State => {
  switch (action.type) {
    case PLEROMA_PRELOAD_IMPORT:
      return preloadImport(state, action, '/api/v1/instance');
    case INSTANCE_FETCH_SUCCESS:
      persistInstance(action.instance);
      return { fetched: true, ...action.instance };
    case INSTANCE_FETCH_FAIL:
      return handleInstanceFetchFail(state, action.error);
    case ADMIN_CONFIG_UPDATE_REQUEST:
    case ADMIN_CONFIG_UPDATE_SUCCESS:
      return create(state, (draft) => importConfigs(draft, action.configs));
    default:
      return state;
  }
};
export { instance as default, initialState as instanceInitialState };
