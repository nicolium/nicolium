import * as v from 'valibot';

import { accountSchema, listSchema } from '../entities';
import { filteredArray } from '../entities/utils';

import type { PlApiBaseClient } from '../client-base';
import type { CreateListParams, GetListAccountsParams, UpdateListParams } from '../params/lists';

type EmptyObject = Record<string, never>;

const lists = (client: PlApiBaseClient) => ({
  /**
   * View your lists
   * Fetch all lists that the user owns.
   * @see {@link https://docs.joinmastodon.org/methods/lists/#get}
   */
  getLists: async () => {
    const response = await client.request('/api/v1/lists');

    return v.parse(filteredArray(listSchema), response.json);
  },

  /**
   * Show a single list
   * Fetch the list with the given ID. Used for verifying the title of a list, and which replies to show within that list.
   * @see {@link https://docs.joinmastodon.org/methods/lists/#get-one}
   */
  getList: async (listId: string) => {
    const response = await client.request(`/api/v1/lists/${listId}`);

    return v.parse(listSchema, response.json);
  },

  /**
   * Create a list
   * Create a new list.
   * @see {@link https://docs.joinmastodon.org/methods/lists/#create}
   */
  createList: async (params: CreateListParams) => {
    const response = await client.request('/api/v1/lists', { method: 'POST', body: params });

    return v.parse(listSchema, response.json);
  },

  /**
   * Update a list
   * Change the title of a list, or which replies to show.
   * @see {@link https://docs.joinmastodon.org/methods/lists/#update}
   */
  updateList: async (listId: string, params: UpdateListParams) => {
    const response = await client.request(`/api/v1/lists/${listId}`, {
      method: 'PUT',
      body: params,
    });

    return v.parse(listSchema, response.json);
  },

  /**
   * Delete a list
   * @see {@link https://docs.joinmastodon.org/methods/lists/#delete}
   */
  deleteList: async (listId: string) => {
    const response = await client.request<EmptyObject>(`/api/v1/lists/${listId}`, {
      method: 'DELETE',
    });

    return response.json;
  },

  /**
   * View accounts in a list
   * @see {@link https://docs.joinmastodon.org/methods/lists/#accounts}
   */
  getListAccounts: (listId: string, params?: GetListAccountsParams) =>
    client.paginatedGet(`/api/v1/lists/${listId}/accounts`, { params }, accountSchema),

  /**
   * Add accounts to a list
   * Add accounts to the given list. Note that the user must be following these accounts.
   * @see {@link https://docs.joinmastodon.org/methods/lists/#accounts-add}
   */
  addListAccounts: async (listId: string, accountIds: string[]) => {
    const response = await client.request<EmptyObject>(`/api/v1/lists/${listId}/accounts`, {
      method: 'POST',
      body: { account_ids: accountIds },
    });

    return response.json;
  },

  /**
   * Remove accounts from list
   * Remove accounts from the given list.
   * @see {@link https://docs.joinmastodon.org/methods/lists/#accounts-remove}
   */
  deleteListAccounts: async (listId: string, accountIds: string[]) => {
    const response = await client.request<EmptyObject>(`/api/v1/lists/${listId}/accounts`, {
      method: 'DELETE',
      body: { account_ids: accountIds },
    });

    return response.json;
  },

  /**
   * Add a list to favourites
   *
   * Requires features{@link Features.listsFavourite}.
   */
  favouriteList: async (listId: string) => {
    const response = await client.request(`/api/v1/lists/${listId}/favourite`, { method: 'POST' });

    return v.parse(listSchema, response.json);
  },

  /**
   * Remove a list from favourites
   *
   * Requires features{@link Features.listsFavourite}.
   */
  unfavouriteList: async (listId: string) => {
    const response = await client.request(`/api/v1/lists/${listId}/unfavourite`, {
      method: 'POST',
    });

    return v.parse(listSchema, response.json);
  },
});

export { lists };
