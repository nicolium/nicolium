import localforage from 'localforage';

import { migrationComplete } from './migrate-legacy-data';

interface IKVStore extends LocalForage {
  getItemOrError: (key: string) => Promise<any>;
}

// localForage
// https://localforage.github.io/localForage/#settings-api-config
const KVStore = localforage.createInstance({
  name: 'nicolium',
  description: 'Nicolium offline data store',
  driver: localforage.INDEXEDDB,
  storeName: 'keyvaluepairs',
}) as IKVStore;

const originalGetItem = KVStore.getItem.bind(KVStore);
KVStore.getItem = async (...args) => {
  await migrationComplete;
  return originalGetItem(...args);
};

// localForage returns 'null' when a key isn't found.
// In the Redux action flow, we want it to fail harder.
KVStore.getItemOrError = (key: string) =>
  KVStore.getItem(key).then((value) => {
    if (value === null) {
      throw new Error(`KVStore: null value for key ${key}`);
    } else {
      return value;
    }
  });

export { KVStore as default };
