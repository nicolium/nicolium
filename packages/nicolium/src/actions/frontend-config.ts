import { getHost } from '@/actions/instance';
import { staticFetch } from '@/api';
import KVStore from '@/storage/kv-store';
import { getClient } from '@/stores/auth';
import { useFrontendConfigStore } from '@/stores/frontend-config';
import { useSettingsStore } from '@/stores/settings';

import type { APIEntity } from '@/types/entities';

const rememberFrontendConfig = (host: string | null) =>
  KVStore.getItemOrError(`frontendConfig:${host}`)
    .then((frontendConfig) => {
      useFrontendConfigStore.getState().actions.rememberConfig(frontendConfig);
      return true;
    })
    .catch(() => false);

/** Conditionally fetches Nicolium config depending on backend features */
const fetchFrontendConfig = async (host: string | null) => {
  const client = getClient();
  const features = client.features;

  if (features.frontendConfigurations) {
    const data = await client.instance.getFrontendConfigurations();
    const foundData = data['nicolium'] || data['pl_fe'];

    if (foundData) {
      importFrontendConfig(foundData, host);
      return foundData;
    }
  }
  return fetchFrontendConfigJson(host);
};

/** Tries to remember the config from browser storage before fetching it */
const loadFrontendConfig = async () => {
  const host = getHost();

  const result = await rememberFrontendConfig(host);

  if (result) {
    fetchFrontendConfig(host);
  } else {
    return fetchFrontendConfig(host);
  }
};

const fetchFrontendConfigJson = (host: string | null) =>
  staticFetch('/instance/nicolium.json')
    .then(({ json: data }) => {
      if (!isObject(data)) throw 'nicolium.json fetch failed';
      importFrontendConfig(data, host);
      return data;
    })
    .catch(() => {
      useFrontendConfigStore.getState().actions.configFetchFailed();
    });

const importFrontendConfig = (frontendConfig: APIEntity, host: string | null) => {
  if (!frontendConfig.brandColor) frontendConfig.brandColor = '#d80482';

  useSettingsStore.getState().actions.loadDefaultSettings(frontendConfig?.defaultSettings);
  useFrontendConfigStore.getState().actions.importConfig(frontendConfig, host || '');
};

// https://stackoverflow.com/a/46663081
const isObject = (o: any) => o instanceof Object && o.constructor === Object;

export { fetchFrontendConfig, loadFrontendConfig };
