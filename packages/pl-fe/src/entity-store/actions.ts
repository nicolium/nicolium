import type { Entities } from './entities';
import type { EntitiesTransaction, Entity } from './types';

const ENTITIES_IMPORT = 'ENTITIES_IMPORT' as const;
const ENTITIES_TRANSACTION = 'ENTITIES_TRANSACTION' as const;

/** Action to import entities into the cache. */
const importEntities = (entities: Entity[], entityType: Entities) => ({
  type: ENTITIES_IMPORT,
  entityType,
  entities,
});

const entitiesTransaction = (transaction: EntitiesTransaction) => ({
  type: ENTITIES_TRANSACTION,
  transaction,
});

/** Any action pertaining to entities. */
type EntityAction = ReturnType<typeof importEntities> | ReturnType<typeof entitiesTransaction>;

export {
  type EntityAction,
  ENTITIES_IMPORT,
  ENTITIES_TRANSACTION,
  importEntities,
  entitiesTransaction,
};
