import type { Entity } from './types';
import type { RootState } from '@/store';

/** Get a single entity by its ID from the store. */
const selectEntity = <TEntity extends Entity>(
  state: RootState,
  entityType: string,
  id: string,
): TEntity | undefined => state.entities[entityType]?.store[id] as TEntity | undefined;

/** Find an entity using a finder function. */
const findEntity = <TEntity extends Entity>(
  state: RootState,
  entityType: string,
  lookupFn: (entity: TEntity) => boolean,
) => {
  const cache = state.entities[entityType];

  if (cache) {
    return (Object.values(cache.store) as TEntity[]).find(lookupFn);
  }
};

export { selectEntity, findEntity };
