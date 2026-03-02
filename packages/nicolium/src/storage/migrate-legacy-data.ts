/**
 * Migrate data from the legacy `pl-fe` namespaces to the new ones using `nicolium`.
 * Includes synchronous migrations for localStorage (ran on import) and async for IndexedDB.
 * Made a hack in @/storage/kv-store to delay getItem calls until the async migration is complete to avoid race conditions.
 * Will remove this migration handling in like a month or so.
 */

import localforage from 'localforage';
import trim from 'lodash/trim';

import { FE_SUBDIRECTORY } from '@/build-config';

// synchronous localStorage migrations

const migrateLocalStorageKey = (oldKey: string, newKey: string) => {
  const value = localStorage.getItem(oldKey);
  if (value !== null && localStorage.getItem(newKey) === null) {
    localStorage.setItem(newKey, value);
    localStorage.removeItem(oldKey);
  }
};

const migrateAuthStorage = () => {
  // subdirectory support, see @/reducers/auth
  const subdir = trim(FE_SUBDIRECTORY, '/');
  const oldNamespace = subdir ? `pl-fe@${FE_SUBDIRECTORY}` : 'pl-fe';
  const newNamespace = subdir ? `nicolium@${FE_SUBDIRECTORY}` : 'nicolium';

  migrateLocalStorageKey(`${oldNamespace}:auth`, `${newNamespace}:auth`);
};

const migratePushNotificationSettings = () => {
  const keysToMigrate: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('plfe_push_notification_data')) {
      keysToMigrate.push(key);
    }
  }

  for (const oldKey of keysToMigrate) {
    const newKey = oldKey.replace(
      'plfe_push_notification_data',
      'nicolium:pushNotificationSettings',
    );
    migrateLocalStorageKey(oldKey, newKey);
  }
};

migrateAuthStorage();
migratePushNotificationSettings();

// async migrations

const migrateIndexedDB = async () => {
  const oldStore = localforage.createInstance({
    name: 'pl-fe',
    driver: localforage.INDEXEDDB,
    storeName: 'keyvaluepairs',
  });

  const newStore = localforage.createInstance({
    name: 'nicolium',
    driver: localforage.INDEXEDDB,
    storeName: 'keyvaluepairs',
  });

  try {
    const oldKeys = await oldStore.keys();
    const newKeys = await newStore.keys();

    if (oldKeys.length === 0 || newKeys.length > 0) {
      await oldStore.dropInstance({ name: 'pl-fe' });
      return;
    }

    for (const oldKey of oldKeys) {
      const value = await oldStore.getItem(oldKey);

      const newKey = oldKey.startsWith('plfe_config:')
        ? oldKey.replace('plfe_config:', 'frontendConfig:')
        : oldKey;
      await newStore.setItem(newKey, value);
    }

    await oldStore.dropInstance({ name: 'pl-fe' });
  } catch (e) {
    console.error('Failed to migrate IndexedDB data', e);
  }
};

const migrationComplete = migrateIndexedDB();

export { migrationComplete };
