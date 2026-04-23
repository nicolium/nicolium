import * as v from 'valibot';
import { create } from 'zustand';

import {
  frontendConfigSchema,
  partialFrontendConfigSchema,
  type FrontendConfig,
  type PartialFrontendConfig,
} from '@/schemas/frontend-config';
import KVStore from '@/storage/kv-store';
import ConfigDB from '@/utils/config-db';

import type { PleromaConfig } from 'pl-api';

const defaultConfig: FrontendConfig = v.parse(frontendConfigSchema, {});

const fallbackConfig: PartialFrontendConfig = {
  brandColor: '#d80482',
};

const parseFrontendConfig = (frontendConfig: unknown): PartialFrontendConfig | null => {
  try {
    return v.parse(partialFrontendConfigSchema, frontendConfig);
  } catch (e) {
    console.error('Failed to parse frontend config', e);
    return null;
  }
};

const persistFrontendConfig = (frontendConfig: PartialFrontendConfig, host: string) => {
  if (host) {
    KVStore.setItem(`frontendConfig:${host}`, frontendConfig).catch(console.error);
  }
};

type State = {
  partialConfig: PartialFrontendConfig;
  config: FrontendConfig;
  actions: {
    importConfig: (config: unknown, host: string) => void;
    rememberConfig: (config: unknown) => void;
    configFetchFailed: () => void;
    importPreload: (data: Record<string, any>) => void;
    importAdminConfigs: (configs: PleromaConfig['configs']) => void;
  };
};

const setConfig = (
  partialConfig: PartialFrontendConfig,
): Pick<State, 'partialConfig' | 'config'> => ({
  partialConfig,
  config: { ...defaultConfig, ...partialConfig },
});

const useFrontendConfigStore = create<State>((set) => ({
  partialConfig: {},
  config: defaultConfig,
  actions: {
    importConfig: (config: unknown, host: string) => {
      const parsed = v.parse(partialFrontendConfigSchema, config);
      persistFrontendConfig(parsed, host);
      set(setConfig(parsed));
    },
    rememberConfig: (config: unknown) => {
      const parsed = parseFrontendConfig(config);
      if (parsed) set(setConfig(parsed));
    },
    configFetchFailed: () => {
      set((state) => setConfig({ ...fallbackConfig, ...state.partialConfig }));
    },
    importPreload: (data: Record<string, any>) => {
      const feData = data['/api/pleroma/frontend_configurations'];
      if (!feData) return;

      const nicoliumConfig = feData.nicolium || feData.pl_fe;
      const merged = nicoliumConfig ? { ...fallbackConfig, ...nicoliumConfig } : fallbackConfig;
      const parsed = parseFrontendConfig(merged);
      if (parsed) set(setConfig(parsed));
    },
    importAdminConfigs: (configs: PleromaConfig['configs']) => {
      try {
        const raw = ConfigDB.find(configs, ':pleroma', ':frontend_configurations')!.value.find(
          (value: Record<string, any>) => value.tuple?.[0] === ':nicolium',
        ).tuple?.[1];
        const parsed = parseFrontendConfig(raw);
        if (parsed) set(setConfig(parsed));
      } catch {
        // config not found, ignore
      }
    },
  },
}));

const useFrontendConfigActions = () => useFrontendConfigStore((state) => state.actions);

export { useFrontendConfigStore, useFrontendConfigActions };
