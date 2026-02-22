import type { Entities } from '../entities';
import type { Entity } from '../types';
import type { BaseSchema, BaseIssue } from 'valibot';

type EntitySchema<TEntity extends Entity = Entity> = BaseSchema<any, TEntity, BaseIssue<unknown>>;

/** Used to look up a single entity by its ID. */
type EntityPath = [entityType: Entities, entityId: string];

/** Callback functions for entity actions. */
interface EntityCallbacks<Value, Error = unknown> {
  onSuccess?(value: Value): void;
  onError?(error: Error): void;
}

/**
 * Passed into hooks to make requests.
 * Must return a response.
 */
type EntityFn<T> = (value: T) => Promise<any>;

export type { EntitySchema, EntityPath, EntityCallbacks, EntityFn };
