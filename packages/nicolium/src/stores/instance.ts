import { type Instance, instanceSchema, type PleromaConfig } from 'pl-api';
import * as v from 'valibot';
import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

import { useScopeUrl } from '@/hooks/use-scope-url';
import KVStore from '@/storage/kv-store';
import { backendUrl, getScopeUrl } from '@/stores/auth';
import ConfigDB from '@/utils/config-db';

const initialInstance: Instance = v.parse(instanceSchema, {});

const getInstanceHost = (url?: string | null): string => {
  if (!url) return '';
  try {
    return new URL(url).host;
  } catch {
    try {
      return new URL(`https://${url}`).host;
    } catch {
      return '';
    }
  }
};

const persistInstance = (instance: { domain: string }, host: string) => {
  const key = host || getInstanceHost(instance.domain);
  if (key) {
    KVStore.setItem(`instance:${key}`, instance).catch(console.error);
  }
};

const getConfigValue = (instanceConfig: Array<any>, key: string) => {
  const value = instanceConfig.find((value) => value?.tuple?.[0] === key);
  return value ? value?.tuple?.[1] : undefined;
};

type State = {
  instances: Record<string, Instance>;
  fetched: Record<string, boolean>;
  /** Whether /api/v1/instance 404'd (and we should display the external auth form). */
  instanceFetchFailed: boolean;
  actions: {
    loadInstance: (instance: Instance, scopeUrl?: string) => void;
    importPreload: (data: Record<string, any>) => void;
    importAdminConfigs: (configs: PleromaConfig['configs'], scopeUrl?: string) => void;
    instanceFetchFailed: (error: unknown, scopeUrl?: string) => void;
    setInstanceFetchFailed: (failed: boolean) => void;
  };
};

const useInstanceStore = create<State>()(
  mutative((set) => ({
    instances: {},
    fetched: {},
    instanceFetchFailed: false,
    actions: {
      loadInstance: (instance: Instance, scopeUrl: string = getScopeUrl()) => {
        const host = getInstanceHost(scopeUrl);
        persistInstance(instance, host);
        set((state) => {
          state.instances[host] = instance;
          state.fetched[host] = true;
        });
      },
      importPreload: (data: Record<string, any>) => {
        const instance = data['/api/v1/instance'];
        const parsed = v.safeParse(instanceSchema, instance);
        if (parsed.success) {
          const host = getInstanceHost(backendUrl);
          set((state) => {
            state.instances[host] = parsed.output;
            state.fetched[host] = true;
          });
        }
      },
      importAdminConfigs: (configs: PleromaConfig['configs'], scopeUrl: string = getScopeUrl()) => {
        const config = ConfigDB.find(configs, ':pleroma', ':instance');
        if (!config) return;

        const value = config.value ?? [];
        const registrationsOpen = getConfigValue(value, ':registrations_open') as
          | boolean
          | undefined;
        const approvalRequired = getConfigValue(value, ':account_approval_required') as
          | boolean
          | undefined;

        const host = getInstanceHost(scopeUrl);

        set((state) => {
          const instance = state.instances[host] ?? initialInstance;
          state.instances[host] = {
            ...instance,
            registrations: {
              ...instance.registrations,
              enabled: registrationsOpen ?? instance.registrations.enabled,
              approval_required: approvalRequired ?? instance.registrations.approval_required,
            },
          };
        });
      },
      instanceFetchFailed: (error: unknown, scopeUrl: string = getScopeUrl()) => {
        if ((error as any)?.response?.status === 401) {
          const host = getInstanceHost(scopeUrl);
          set((state) => {
            const instance = state.instances[host] ?? initialInstance;
            state.instances[host] = {
              ...instance,
              title: instance.title || '██████',
              description: instance.description || '████████████',
            };
          });
        }
      },
      setInstanceFetchFailed: (failed: boolean) => {
        set({ instanceFetchFailed: failed });
      },
    },
  })),
);

const useInstance = (scopeUrl?: string): Instance => {
  const currentScope = useScopeUrl();
  const host = getInstanceHost(scopeUrl ?? currentScope);
  return useInstanceStore((state) => state.instances[host] ?? initialInstance);
};

const useInstanceFetched = (scopeUrl?: string): boolean => {
  const currentScope = useScopeUrl();
  const host = getInstanceHost(scopeUrl ?? currentScope);
  return useInstanceStore((state) => !!state.fetched[host]);
};

const getInstance = (scopeUrl: string = getScopeUrl()): Instance => {
  const host = getInstanceHost(scopeUrl);
  return useInstanceStore.getState().instances[host] ?? initialInstance;
};

const useInstanceActions = () => useInstanceStore((state) => state.actions);

export {
  useInstanceStore,
  useInstance,
  useInstanceFetched,
  useInstanceActions,
  getInstance,
  getInstanceHost,
  initialInstance,
};
