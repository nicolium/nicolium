import { type Instance, instanceSchema, type PleromaConfig } from 'pl-api';
import * as v from 'valibot';
import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

import KVStore from '@/storage/kv-store';
import ConfigDB from '@/utils/config-db';

const initialInstance: Instance = v.parse(instanceSchema, {});

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

const getConfigValue = (instanceConfig: Array<any>, key: string) => {
  const value = instanceConfig.find((value) => value?.tuple?.[0] === key);
  return value ? value?.tuple?.[1] : undefined;
};

type State = {
  instance: Instance;
  fetched: boolean;
  /** Whether /api/v1/instance 404'd (and we should display the external auth form). */
  instanceFetchFailed: boolean;
  actions: {
    loadInstance: (instance: Instance) => void;
    importPreload: (data: Record<string, any>) => void;
    importAdminConfigs: (configs: PleromaConfig['configs']) => void;
    instanceFetchFailed: (error: unknown) => void;
    setInstanceFetchFailed: (failed: boolean) => void;
  };
};

const useInstanceStore = create<State>()(
  mutative((set) => ({
    instance: initialInstance,
    fetched: false,
    instanceFetchFailed: false,
    actions: {
      loadInstance: (instance: Instance) => {
        persistInstance(instance);
        set({ instance, fetched: true });
      },
      importPreload: (data: Record<string, any>) => {
        const instance = data['/api/v1/instance'];
        const parsed = v.safeParse(instanceSchema, instance);
        if (parsed.success) {
          set({ instance: parsed.output, fetched: true });
        }
      },
      importAdminConfigs: (configs: PleromaConfig['configs']) => {
        const config = ConfigDB.find(configs, ':pleroma', ':instance');
        if (!config) return;

        const value = config.value ?? [];
        const registrationsOpen = getConfigValue(value, ':registrations_open') as
          | boolean
          | undefined;
        const approvalRequired = getConfigValue(value, ':account_approval_required') as
          | boolean
          | undefined;

        set((state) => {
          state.instance.registrations = {
            ...state.instance.registrations,
            enabled: registrationsOpen ?? state.instance.registrations.enabled,
            approval_required: approvalRequired ?? state.instance.registrations.approval_required,
          };
        });
      },
      instanceFetchFailed: (error: unknown) => {
        if ((error as any)?.response?.status === 401) {
          set((state) => {
            state.instance.title = state.instance.title || '██████';
            state.instance.description = state.instance.description || '████████████';
          });
        }
      },
      setInstanceFetchFailed: (failed: boolean) => {
        set({ instanceFetchFailed: failed });
      },
    },
  })),
);

const useInstance = () => useInstanceStore((state) => state.instance);
const useInstanceActions = () => useInstanceStore((state) => state.actions);

export { useInstanceStore, useInstance, useInstanceActions };
