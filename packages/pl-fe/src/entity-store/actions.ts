import type { Entities } from './entities';
import type { EntitiesTransaction, Entity, ImportPosition } from './types';

const ENTITIES_IMPORT = 'ENTITIES_IMPORT' as const;
const ENTITIES_DELETE = 'ENTITIES_DELETE' as const;
const ENTITIES_TRANSACTION = 'ENTITIES_TRANSACTION' as const;

/** Action to import entities into the cache. */
const importEntities = (
  entities: Entity[],
  entityType: Entities,
  listKey?: string,
  pos?: ImportPosition,
) => ({
  type: ENTITIES_IMPORT,
  entityType,
  entities,
  listKey,
  pos,
});

interface DeleteEntitiesOpts {
  preserveLists?: boolean;
}

const deleteEntities = (
  ids: Iterable<string>,
  entityType: string,
  opts: DeleteEntitiesOpts = {},
) => ({
  type: ENTITIES_DELETE,
  ids,
  entityType,
  opts,
});

const entitiesTransaction = (transaction: EntitiesTransaction) => ({
  type: ENTITIES_TRANSACTION,
  transaction,
});

/** Any action pertaining to entities. */
type EntityAction =
  | ReturnType<typeof importEntities>
  | ReturnType<typeof deleteEntities>
  | ReturnType<typeof entitiesTransaction>;

export {
  type DeleteEntitiesOpts,
  type EntityAction,
  ENTITIES_IMPORT,
  ENTITIES_DELETE,
  ENTITIES_TRANSACTION,
  importEntities,
  deleteEntities,
  entitiesTransaction,
};
