import * as v from 'valibot';

import {
  blockedAccountSchema,
  filterKeywordSchema,
  filterSchema,
  filterStatusSchema,
  mutedAccountSchema,
  relationshipSchema,
} from '@/entities';
import { filteredArray } from '@/entities/utils';

import type { PlApiBaseClient } from '@/client-base';
import type {
  BlockAccountParams,
  CreateFilterParams,
  GetBlocksParams,
  GetDomainBlocksParams,
  GetMutesParams,
  MuteAccountParams,
  UpdateFilterParams,
} from '@/params/filtering';
import type { EmptyObject } from '@/utils/types';

const filtering = (client: PlApiBaseClient) => ({
  /**
   * Block account
   * Block the given account. Clients should filter statuses from this account if received (e.g. due to a boost in the Home timeline)
   * @see {@link https://docs.joinmastodon.org/methods/accounts/#block}
   * `duration` parameter requires features{@link Features.blocksDuration}.
   */
  blockAccount: async (accountId: string, params?: BlockAccountParams) => {
    const response = await client.request(`/api/v1/accounts/${accountId}/block`, {
      method: 'POST',
      body: params,
    });

    return v.parse(relationshipSchema, response.json);
  },

  /**
   * Unblock account
   * Unblock the given account.
   * @see {@link https://docs.joinmastodon.org/methods/accounts/#unblock}
   */
  unblockAccount: async (accountId: string) => {
    const response = await client.request(`/api/v1/accounts/${accountId}/unblock`, {
      method: 'POST',
    });

    return v.parse(relationshipSchema, response.json);
  },

  /**
   * Mute account
   * Mute the given account. Clients should filter statuses and notifications from this account, if received (e.g. due to a boost in the Home timeline).
   *
   * Requires features{@link Features.mutes}.
   * @see {@link https://docs.joinmastodon.org/methods/accounts/#mute}
   */
  muteAccount: async (accountId: string, params?: MuteAccountParams) => {
    const response = await client.request(`/api/v1/accounts/${accountId}/mute`, {
      method: 'POST',
      body: params,
    });

    return v.parse(relationshipSchema, response.json);
  },

  /**
   * Unmute account
   * Unmute the given account.
   *
   * Requires features{@link Features.mutes}.
   * @see {@link https://docs.joinmastodon.org/methods/accounts/#unmute}
   */
  unmuteAccount: async (accountId: string) => {
    const response = await client.request(`/api/v1/accounts/${accountId}/unmute`, {
      method: 'POST',
    });

    return v.parse(relationshipSchema, response.json);
  },

  /**
   * View muted accounts
   * Accounts the user has muted.
   *
   * Requires features{@link Features.mutes}.
   * @see {@link https://docs.joinmastodon.org/methods/mutes/#get}
   */
  getMutes: (params?: GetMutesParams) =>
    client.paginatedGet('/api/v1/mutes', { params }, mutedAccountSchema),

  /**
   * View blocked users
   * @see {@link https://docs.joinmastodon.org/methods/blocks/#get}
   */
  getBlocks: (params?: GetBlocksParams) =>
    client.paginatedGet('/api/v1/blocks', { params }, blockedAccountSchema),

  /**
   * Get domain blocks
   * View domains the user has blocked.
   * @see {@link https://docs.joinmastodon.org/methods/domain_blocks/#get}
   */
  getDomainBlocks: (params?: GetDomainBlocksParams) =>
    client.paginatedGet('/api/v1/domain_blocks', { params }, v.string()),

  /**
   * Block a domain
   * Block a domain to:
   * - hide all public posts from it
   * - hide all notifications from it
   * - remove all followers from it
   * - prevent following new users from it (but does not remove existing follows)
   * @see {@link https://docs.joinmastodon.org/methods/domain_blocks/#block}
   */
  blockDomain: async (domain: string) => {
    const response = await client.request<EmptyObject>('/api/v1/domain_blocks', {
      method: 'POST',
      body: { domain },
    });

    return response.json;
  },

  /**
   * Unblock a domain
   * Remove a domain block, if it exists in the user’s array of blocked domains.
   * @see {@link https://docs.joinmastodon.org/methods/domain_blocks/#unblock}
   */
  unblockDomain: async (domain: string) => {
    const response = await client.request<EmptyObject>('/api/v1/domain_blocks', {
      method: 'DELETE',
      body: { domain },
    });

    return response.json;
  },

  /**
   * View all filters
   * Obtain a list of all filter groups for the current user.
   *
   * Requires features{@link Features.filters} or features{@link Features['filtersV2']}.
   * @see {@link https://docs.joinmastodon.org/methods/filters/#get}
   */
  getFilters: async () => {
    const response = await client.request(
      client.features.filtersV2 ? '/api/v2/filters' : '/api/v1/filters',
    );

    return v.parse(filteredArray(filterSchema), response.json);
  },

  /**
   * View a specific filter
   * Obtain a single filter group owned by the current user.
   *
   * Requires features{@link Features.filters} or features{@link Features['filtersV2']}.
   * @see {@link https://docs.joinmastodon.org/methods/filters/#get-one}
   */
  getFilter: async (filterId: string) => {
    const response = await client.request(
      client.features.filtersV2 ? `/api/v2/filters/${filterId}` : `/api/v1/filters/${filterId}`,
    );

    return v.parse(filterSchema, response.json);
  },

  /**
   * Create a filter
   * Create a filter group with the given parameters.
   *
   * Requires features{@link Features.filters} or features{@link Features['filtersV2']}.
   * @see {@link https://docs.joinmastodon.org/methods/filters/#create}
   */
  createFilter: async (params: CreateFilterParams) => {
    const { filtersV2 } = client.features;
    const response = await client.request(filtersV2 ? '/api/v2/filters' : '/api/v1/filters', {
      method: 'POST',
      body: filtersV2
        ? params
        : {
            phrase: params.keywords_attributes[0]?.keyword,
            context: params.context,
            irreversible: params.filter_action === 'hide',
            whole_word: params.keywords_attributes[0]?.whole_word,
            expires_in: params.expires_in,
          },
    });

    return v.parse(filterSchema, response.json);
  },

  /**
   * Update a filter
   * Update a filter group with the given parameters.
   *
   * Requires features{@link Features.filters} or features{@link Features['filtersV2']}.
   * @see {@link https://docs.joinmastodon.org/methods/filters/#update}
   */
  updateFilter: async (filterId: string, params: UpdateFilterParams) => {
    const { filtersV2 } = client.features;
    const response = await client.request(
      filtersV2 ? `/api/v2/filters/${filterId}` : `/api/v1/filters/${filterId}`,
      {
        method: 'PUT',
        body: filtersV2
          ? params
          : {
              phrase: params.keywords_attributes?.[0]?.keyword,
              context: params.context,
              irreversible: params.filter_action === 'hide',
              whole_word: params.keywords_attributes?.[0]?.whole_word,
              expires_in: params.expires_in,
            },
      },
    );

    return v.parse(filterSchema, response.json);
  },

  /**
   * Delete a filter
   * Delete a filter group with the given id.
   *
   * Requires features{@link Features.filters} or features{@link Features['filtersV2']}.
   * @see {@link https://docs.joinmastodon.org/methods/filters/#delete}
   */
  deleteFilter: async (filterId: string) => {
    const response = await client.request<EmptyObject>(
      client.features.filtersV2 ? `/api/v2/filters/${filterId}` : `/api/v1/filters/${filterId}`,
      { method: 'DELETE' },
    );

    return response.json;
  },

  /**
   * View keywords added to a filter
   * List all keywords attached to the current filter group.
   *
   * Requires features{@link Features['filtersV2']}.
   * @see {@link https://docs.joinmastodon.org/methods/filters/#keywords-get}
   */
  getFilterKeywords: async (filterId: string) => {
    const response = await client.request(`/api/v2/filters/${filterId}/keywords`);

    return v.parse(filteredArray(filterKeywordSchema), response.json);
  },

  /**
   * Add a keyword to a filter
   * Add the given keyword to the specified filter group
   *
   * Requires features{@link Features['filtersV2']}.
   * @see {@link https://docs.joinmastodon.org/methods/filters/#keywords-create}
   */
  addFilterKeyword: async (filterId: string, keyword: string, whole_word?: boolean) => {
    const response = await client.request(`/api/v2/filters/${filterId}/keywords`, {
      method: 'POST',
      body: { keyword, whole_word },
    });

    return v.parse(filterKeywordSchema, response.json);
  },

  /**
   * View a single keyword
   * Get one filter keyword by the given id.
   *
   * Requires features{@link Features['filtersV2']}.
   * @see {@link https://docs.joinmastodon.org/methods/filters/#keywords-get-one}
   */
  getFilterKeyword: async (filterId: string) => {
    const response = await client.request(`/api/v2/filters/keywords/${filterId}`);

    return v.parse(filterKeywordSchema, response.json);
  },

  /**
   * Edit a keyword within a filter
   * Update the given filter keyword.
   *
   * Requires features{@link Features['filtersV2']}.
   * @see {@link https://docs.joinmastodon.org/methods/filters/#keywords-update}
   */
  updateFilterKeyword: async (filterId: string, keyword: string, whole_word?: boolean) => {
    const response = await client.request(`/api/v2/filters/keywords/${filterId}`, {
      method: 'PUT',
      body: { keyword, whole_word },
    });

    return v.parse(filterKeywordSchema, response.json);
  },

  /**
   * Remove keywords from a filter
   * Deletes the given filter keyword.
   *
   * Requires features{@link Features['filtersV2']}.
   * @see {@link https://docs.joinmastodon.org/methods/filters/#keywords-delete}
   */
  deleteFilterKeyword: async (filterId: string) => {
    const response = await client.request<EmptyObject>(`/api/v2/filters/keywords/${filterId}`, {
      method: 'DELETE',
    });

    return response.json;
  },

  /**
   * View all status filters
   * Obtain a list of all status filters within this filter group.
   *
   * Requires features{@link Features['filtersV2']}.
   * @see {@link https://docs.joinmastodon.org/methods/filters/#statuses-get}
   */
  getFilterStatuses: async (filterId: string) => {
    const response = await client.request(`/api/v2/filters/${filterId}/statuses`);

    return v.parse(filteredArray(filterStatusSchema), response.json);
  },

  /**
   * Add a status to a filter group
   * Add a status filter to the current filter group.
   *
   * Requires features{@link Features['filtersV2']}.
   * @see {@link https://docs.joinmastodon.org/methods/filters/#statuses-add}
   */
  addFilterStatus: async (filterId: string, statusId: string) => {
    const response = await client.request(`/api/v2/filters/${filterId}/statuses`, {
      method: 'POST',
      body: { status_id: statusId },
    });

    return v.parse(filterStatusSchema, response.json);
  },

  /**
   * View a single status filter
   * Obtain a single status filter.
   *
   * Requires features{@link Features['filtersV2']}.
   * @see {@link https://docs.joinmastodon.org/methods/filters/#statuses-get-one}
   */
  getFilterStatus: async (statusId: string) => {
    const response = await client.request(`/api/v2/filters/statuses/${statusId}`);

    return v.parse(filterStatusSchema, response.json);
  },

  /**
   * Remove a status from a filter group
   * Remove a status filter from the current filter group.
   *
   * Requires features{@link Features['filtersV2']}.
   * @see {@link https://docs.joinmastodon.org/methods/filters/#statuses-remove}
   */
  deleteFilterStatus: async (statusId: string) => {
    const response = await client.request<EmptyObject>(`/api/v2/filters/statuses/${statusId}`, {
      method: 'DELETE',
    });

    return response.json;
  },
});

export { filtering };
