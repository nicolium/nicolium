import { create, type Immutable, type Draft } from 'mutative';

import { ENTITIES_IMPORT, ENTITIES_TRANSACTION, type EntityAction } from './actions';
import { Entities } from './entities';
import { createCache, updateStore } from './utils';

import type { EntitiesTransaction, Entity, EntityCache } from './types';

/** Entity reducer state. */
type State = Immutable<{
  [entityType: string]: EntityCache | undefined;
}>;

/** Import entities into the cache. */
const importEntities = (draft: Draft<State>, entityType: Entities, entities: Entity[]) => {
  const cache = draft[entityType] ?? createCache();
  cache.store = updateStore(cache.store, entities);

  draft[entityType] = cache;
};

const doTransaction = (draft: Draft<State>, transaction: EntitiesTransaction) => {
  for (const [entityType, changes] of Object.entries(transaction)) {
    const cache = draft[entityType] ?? createCache();
    for (const [id, change] of Object.entries(changes)) {
      const entity = cache.store[id];
      if (entity) {
        cache.store[id] = change(entity);
      }
    }
  }
};

/** Stores various entity data and lists in a one reducer. */
const reducer = (state: Readonly<State> = {}, action: EntityAction): State => {
  switch (action.type) {
    case ENTITIES_IMPORT:
      return create(
        state,
        (draft) => {
          importEntities(draft, action.entityType, action.entities);
        },
        { enableAutoFreeze: true },
      );
    case ENTITIES_TRANSACTION:
      return create(state, (draft) => {
        doTransaction(draft, action.transaction);
      });
    default:
      return state;
  }
};

export { reducer as default };
