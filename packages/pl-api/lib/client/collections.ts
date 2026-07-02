import * as v from 'valibot';

import { collectionItemSchema, collectionSchema, collectionWithAccountsSchema } from '@/entities';
import { filteredArray } from '@/entities/utils';
import { getLinks } from '@/request';
import { PaginatedResponse } from '@/responses';

import type { PlApiBaseClient } from '@/client-base';
import type { Collection } from '@/entities';
import type {
  CreateCollectionParams,
  GetCollectionsParams,
  UpdateCollectionParams,
} from '@/params/collections';
import type { EmptyObject } from '@/utils/types';

const collections = (client: PlApiBaseClient) => {
  const getCollections = async (
    path: string,
    params?: GetCollectionsParams,
  ): Promise<PaginatedResponse<Collection>> => {
    const response = await client.request(path, { params });
    const { prev, next } = getLinks(response);

    return new PaginatedResponse(
      v.parse(filteredArray(collectionSchema), response.json?.collections),
      {
        previous: prev ? () => getCollections(prev) : null,
        next: next ? () => getCollections(next) : null,
        partial: response.status === 206,
      },
    );
  };

  return {
    /**
     * Create a new Collection.
     * Requires features{@link Features.collections}.
     */
    createCollection: async (params: CreateCollectionParams) => {
      const response = await client.request('/api/v1/collections', {
        method: 'POST',
        body: params,
      });

      return v.parse(collectionSchema, response.json?.collection);
    },

    /**
     * Get a single Collection
     * This returns an object with the actual Collection plus a list of Account objects that include all accounts in the Collection plus the owner.
     * Requires features{@link Features.collections}.
     */
    getCollection: async (collectionId: string) => {
      const response = await client.request(`/api/v1/collections/${collectionId}`);

      return v.parse(collectionWithAccountsSchema, response.json);
    },

    /**
     * Get all Collections from a given account
     * Requires features{@link Features.collections}.
     */
    getAccountCollections: (accountId: string, params?: GetCollectionsParams) =>
      getCollections(`/api/v1/accounts/${accountId}/collections`, params),

    /**
     * Get all Collections the given account is featured in
     * Requires features{@link Features.collections}.
     */
    getAccountInCollections: (accountId: string, params?: GetCollectionsParams) =>
      getCollections(`/api/v1/accounts/${accountId}/in_collections`, params),

    /**
     * Update an existing Collection.
     * Requires features{@link Features.collections}.
     */
    updateCollection: async (collectionId: string, params: UpdateCollectionParams) => {
      const response = await client.request(`/api/v1/collections/${collectionId}`, {
        method: 'PATCH',
        body: params,
      });

      return v.parse(collectionSchema, response.json?.collection);
    },

    /**
     * Delete a Collection.
     * Requires features{@link Features.collections}.
     */
    deleteCollection: async (collectionId: string) => {
      const response = await client.request<EmptyObject>(`/api/v1/collections/${collectionId}`, {
        method: 'DELETE',
      });

      return response.json;
    },

    /**
     * Add an account to a Collection.
     * Requires features{@link Features.collections}.
     */
    addCollectionItem: async (collectionId: string, accountId: string) => {
      const response = await client.request(`/api/v1/collections/${collectionId}/items`, {
        method: 'POST',
        body: { account_id: accountId },
      });

      return v.parse(collectionItemSchema, response.json?.collection_item);
    },

    /**
     * Remove an account from a Collection.
     * Requires features{@link Features.collections}.
     */
    removeCollectionItem: async (collectionId: string, itemId: string) => {
      const response = await client.request<EmptyObject>(
        `/api/v1/collections/${collectionId}/items/${itemId}`,
        { method: 'DELETE' },
      );

      return response.json;
    },

    /**
     * Remove the current user from a Collection created by a different user.
     * Requires features{@link Features.collections}.
     */
    revokeCollectionItem: async (collectionId: string, itemId: string) => {
      const response = await client.request<EmptyObject>(
        `/api/v1/collections/${collectionId}/items/${itemId}/revoke`,
        { method: 'POST' },
      );

      return response.json;
    },
  };
};

export { collections };
