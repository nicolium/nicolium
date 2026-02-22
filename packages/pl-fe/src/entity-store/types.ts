/** A Mastodon API entity. */
interface Entity {
  /** Unique ID for the entity (usually the primary key in the database). */
  id: string;
}

/** Store of entities by ID. */
interface EntityStore<TEntity extends Entity = Entity> {
  [id: string]: TEntity | undefined;
}

/** Cache data pertaining to a paritcular entity type. */
interface EntityCache<TEntity extends Entity = Entity> {
  /** Map of entities of this type. */
  store: EntityStore<TEntity>;
}

/** Whether to import items at the start or end of the list. */
type ImportPosition = 'start' | 'end';

/** Map of entity mutation functions to perform at once on the store. */
interface EntitiesTransaction {
  [entityType: string]: {
    [entityId: string]: <TEntity extends Entity>(entity: TEntity) => TEntity;
  };
}

export type { Entity, EntityStore, EntityCache, ImportPosition, EntitiesTransaction };
