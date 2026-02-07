import { entitiesTransaction } from '@/entity-store/actions';
import { useAppDispatch } from '@/hooks/use-app-dispatch';

import type { EntityTypes } from '@/entity-store/entities';
import type { EntitiesTransaction, Entity } from '@/entity-store/types';

type Updater<TEntity extends Entity> = Record<string, (entity: TEntity) => TEntity>

type Changes = Partial<{
  [K in keyof EntityTypes]: Updater<EntityTypes[K]>
}>

const useTransaction = () => {
  const dispatch = useAppDispatch();

  const transaction = (changes: Changes): void => {
    dispatch(entitiesTransaction(changes as EntitiesTransaction));
  };

  return { transaction };
};

export { useTransaction };
