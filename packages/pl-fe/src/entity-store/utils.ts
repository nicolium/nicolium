import type { Entity, EntityStore, EntityCache } from './types';

/** Insert the entities into the store. */
const updateStore = (store: EntityStore, entities: Entity[]): EntityStore =>
  entities.reduce<EntityStore>(
    (store, entity) => {
      store[entity.id] = entity;
      return store;
    },
    { ...store },
  );

/** Create an empty entity cache. */
const createCache = (): EntityCache => ({
  store: {},
});

export { updateStore, createCache };
