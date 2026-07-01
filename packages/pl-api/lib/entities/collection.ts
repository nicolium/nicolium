import * as v from 'valibot';

import { accountSchema } from './account';
import { datetimeSchema, filteredArray } from './utils';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/ShallowTag/}
 */
const shallowTagSchema = v.object({
  name: v.string(),
  url: v.fallback(v.optional(v.string()), undefined),
});

/**
 * @category Entity types
 */
type ShallowTag = v.InferOutput<typeof shallowTagSchema>;

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/CollectionItem/}
 */
const collectionItemSchema = v.object({
  id: v.string(),
  account_id: v.fallback(v.nullable(v.string()), null),
  state: v.picklist(['pending', 'accepted']),
  created_at: v.fallback(datetimeSchema, () => new Date().toISOString()),
});

/**
 * @category Entity types
 */
type CollectionItem = v.InferOutput<typeof collectionItemSchema>;

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/Collection/}
 */
const collectionSchema = v.object({
  id: v.string(),
  account_id: v.string(),
  uri: v.fallback(v.optional(v.string()), undefined),
  url: v.fallback(v.nullable(v.string()), null),
  name: v.string(),
  description: v.fallback(v.string(), ''),
  language: v.fallback(v.nullable(v.string()), null),
  local: v.fallback(v.boolean(), false),
  sensitive: v.fallback(v.boolean(), false),
  discoverable: v.fallback(v.boolean(), false),
  tag: v.fallback(v.nullable(shallowTagSchema), null),
  item_count: v.fallback(v.number(), 0),
  items: filteredArray(collectionItemSchema),
  created_at: v.fallback(datetimeSchema, () => new Date().toISOString()),
  updated_at: v.fallback(datetimeSchema, () => new Date().toISOString()),
});

/**
 * @category Entity types
 */
type Collection = v.InferOutput<typeof collectionSchema>;

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/CollectionWithAccounts/}
 */
const collectionWithAccountsSchema = v.object({
  accounts: filteredArray(accountSchema),
  collection: collectionSchema,
});

/**
 * @category Entity types
 */
type CollectionWithAccounts = v.InferOutput<typeof collectionWithAccountsSchema>;

export {
  shallowTagSchema,
  collectionItemSchema,
  collectionSchema,
  collectionWithAccountsSchema,
  type ShallowTag,
  type CollectionItem,
  type Collection,
  type CollectionWithAccounts,
};
