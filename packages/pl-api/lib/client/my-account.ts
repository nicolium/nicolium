import * as v from 'valibot';

import {
  accountSchema,
  bookmarkFolderSchema,
  featuredTagSchema,
  relationshipSchema,
  statusSchema,
  suggestionSchema,
  tagSchema,
} from '@/entities';
import { filteredArray } from '@/entities/utils';
import { GOTOSOCIAL, ICESHRIMP_NET, MITRA, PIXELFED, PLEROMA } from '@/features';
import { getNextLink, getPrevLink } from '@/request';
import { PaginatedResponse } from '@/responses';

import type { accounts } from './accounts';
import type { PlApiBaseClient } from '@/client-base';
import type { Account } from '@/entities';
import type {
  CreateBookmarkFolderParams,
  GetBookmarksParams,
  GetEndorsementsParams,
  GetFavouritesParams,
  GetFollowRequestsParams,
  GetFollowedTagsParams,
  UpdateBookmarkFolderParams,
} from '@/params/my-account';
import type { EmptyObject } from '@/utils/types';

const paginatedIceshrimpAccountsList = async <T>(
  client: PlApiBaseClient & { accounts: ReturnType<typeof accounts> },
  url: string,
  fn: (body: T) => Array<string>,
): Promise<PaginatedResponse<Account>> => {
  await client.getIceshrimpAccessToken();

  const response = await client.request<T>(url);
  const ids = fn(response.json);

  const items = await client.accounts.getAccounts(ids);

  const prevLink = getPrevLink(response);
  const nextLink = getNextLink(response);

  return new PaginatedResponse(items, {
    previous: prevLink ? () => paginatedIceshrimpAccountsList(client, prevLink, fn) : null,
    next: nextLink ? () => paginatedIceshrimpAccountsList(client, nextLink, fn) : null,
    partial: response.status === 206,
  });
};

const myAccount = (client: PlApiBaseClient & { accounts: ReturnType<typeof accounts> }) => ({
  /**
   * View bookmarked statuses
   * Statuses the user has bookmarked.
   * @see {@link https://docs.joinmastodon.org/methods/bookmarks/#get}
   */
  getBookmarks: (params?: GetBookmarksParams) =>
    client.paginatedGet(
      client.features.bookmarkFoldersMultiple && params?.folder_id
        ? `/api/v1/bookmark_categories/${params.folder_id}/statuses`
        : '/api/v1/bookmarks',
      { params },
      statusSchema,
    ),

  /**
   * View favourited statuses
   * Statuses the user has favourited.
   * @see {@link https://docs.joinmastodon.org/methods/favourites/#get}
   */
  getFavourites: (params?: GetFavouritesParams) =>
    client.paginatedGet('/api/v1/favourites', { params }, statusSchema),

  /**
   * View pending follow requests
   * @see {@link https://docs.joinmastodon.org/methods/follow_requests/#get}
   */
  getFollowRequests: (params?: GetFollowRequestsParams) =>
    client.paginatedGet('/api/v1/follow_requests', { params }, accountSchema),

  /**
   * View outgoing follow requests
   *
   * Requires features{@link Features.outgoingFollowRequests}.
   */
  getOutgoingFollowRequests: (params?: GetFollowRequestsParams) => {
    if (client.features.version.software === ICESHRIMP_NET) {
      return paginatedIceshrimpAccountsList(
        client,
        '/api/iceshrimp/follow_requests/outgoing',
        (response: Array<{ user: { id: string } }>) => response.map(({ user }) => user.id),
      );
    }

    switch (client.features.version.software) {
      case GOTOSOCIAL:
      case MITRA:
        return client.paginatedGet('/api/v1/follow_requests/outgoing', { params }, accountSchema);

      default:
        return client.paginatedGet(
          '/api/v1/pleroma/outgoing_follow_requests',
          { params },
          accountSchema,
        );
    }
  },

  /**
   * Accept follow request
   * @see {@link https://docs.joinmastodon.org/methods/follow_requests/#accept}
   */
  acceptFollowRequest: async (accountId: string) => {
    const response = await client.request(`/api/v1/follow_requests/${accountId}/authorize`, {
      method: 'POST',
    });

    return v.parse(relationshipSchema, response.json);
  },

  /**
   * Reject follow request
   * @see {@link https://docs.joinmastodon.org/methods/follow_requests/#reject}
   */
  rejectFollowRequest: async (accountId: string) => {
    const response = await client.request(`/api/v1/follow_requests/${accountId}/reject`, {
      method: 'POST',
    });

    return v.parse(relationshipSchema, response.json);
  },

  /**
   * View currently featured profiles
   * Accounts that the user is currently featuring on their profile.
   * @see {@link https://docs.joinmastodon.org/methods/endorsements/#get}
   */
  getEndorsements: (params?: GetEndorsementsParams) =>
    client.paginatedGet('/api/v1/endorsements', { params }, accountSchema),

  /**
   * View your featured tags
   * List all hashtags featured on your profile.
   *
   * Requires features{@link Features.featuredTags}.
   * @see {@link https://docs.joinmastodon.org/methods/featured_tags/#get}
   */
  getFeaturedTags: async () => {
    const response = await client.request('/api/v1/featured_tags');

    return v.parse(filteredArray(featuredTagSchema), response.json);
  },

  /**
   * Feature a tag
   * Promote a hashtag on your profile.
   *
   * Requires features{@link Features.featuredTags}.
   * @see {@link https://docs.joinmastodon.org/methods/featured_tags/#feature}
   */
  featureTag: async (name: string) => {
    const response = await client.request('/api/v1/featured_tags', {
      method: 'POST',
      body: { name },
    });

    return v.parse(filteredArray(featuredTagSchema), response.json);
  },

  /**
   * Unfeature a tag
   * Stop promoting a hashtag on your profile.
   *
   * Requires features{@link Features.featuredTags}.
   * @see {@link https://docs.joinmastodon.org/methods/featured_tags/#unfeature}
   */
  unfeatureTag: async (name: string) => {
    const response = await client.request<EmptyObject>('/api/v1/featured_tags', {
      method: 'DELETE',
      body: { name },
    });

    return response.json;
  },

  /**
   * View suggested tags to feature
   * Shows up to 10 recently-used tags.
   *
   * Requires features{@link Features.featuredTags}.
   * @see {@link https://docs.joinmastodon.org/methods/featured_tags/#suggestions}
   */
  getFeaturedTagsSuggestions: async () => {
    const response = await client.request('/api/v1/featured_tags/suggestions');

    return v.parse(filteredArray(tagSchema), response.json);
  },

  /**
   * View all followed tags
   * List your followed hashtags.
   *
   * Requires features{@link Features.followHashtags}.
   * @see {@link https://docs.joinmastodon.org/methods/followed_tags/#get}
   */
  getFollowedTags: (params?: GetFollowedTagsParams) =>
    client.paginatedGet('/api/v1/followed_tags', { params }, tagSchema),

  /**
   * View information about a single tag
   * Show a hashtag and its associated information
   * @see {@link https://docs.joinmastodon.org/methods/tags/#get}
   */
  getTag: async (tagId: string) => {
    const response = await client.request(`/api/v1/tags/${tagId}`);

    return v.parse(tagSchema, response.json);
  },

  /**
   * Follow a hashtag
   * Follow a hashtag. Posts containing a followed hashtag will be inserted into your home timeline.
   * @see {@link https://docs.joinmastodon.org/methods/tags/#follow}
   */
  followTag: async (tagId: string) => {
    const response = await client.request(`/api/v1/tags/${tagId}/follow`, { method: 'POST' });

    return v.parse(tagSchema, response.json);
  },

  /**
   * Unfollow a hashtag
   * Unfollow a hashtag. Posts containing this hashtag will no longer be inserted into your home timeline.
   * @see {@link https://docs.joinmastodon.org/methods/tags/#unfollow}
   */
  unfollowTag: async (tagId: string) => {
    const response = await client.request(`/api/v1/tags/${tagId}/unfollow`, { method: 'POST' });

    return v.parse(tagSchema, response.json);
  },

  /**
   * View follow suggestions
   * Accounts that are promoted by staff, or that the user has had past positive interactions with, but is not yet following.
   *
   * Requires features{@link Features.suggestions}.
   * @see {@link https://docs.joinmastodon.org/methods/suggestions/#v2}
   */
  getSuggestions: async (limit?: number) => {
    const response = await client.request(
      client.features.version.software === PIXELFED
        ? '/api/v1.1/discover/accounts/popular'
        : client.features.suggestionsV2
          ? '/api/v2/suggestions'
          : '/api/v1/suggestions',
      { params: { limit } },
    );

    return v.parse(filteredArray(suggestionSchema), response.json);
  },

  /**
   * Remove a suggestion
   * Remove an account from follow suggestions.
   *
   * Requires features{@link Features.suggestionsDismiss}.
   * @see {@link https://docs.joinmastodon.org/methods/suggestions/#remove}
   */
  dismissSuggestions: async (accountId: string) => {
    const response = await client.request<EmptyObject>(`/api/v1/suggestions/${accountId}`, {
      method: 'DELETE',
    });

    return response.json;
  },

  /**
   * Gets user bookmark folders
   *
   * Requires features{@link Features.bookmarkFolders}.
   * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#get-apiv1pleromabookmark_folders}
   */
  getBookmarkFolders: async () => {
    const response = await client.request(
      client.features.version.software === PLEROMA
        ? '/api/v1/pleroma/bookmark_folders'
        : '/api/v1/bookmark_categories',
    );

    return v.parse(filteredArray(bookmarkFolderSchema), response.json);
  },

  /**
   * Creates a bookmark folder
   *
   * Requires features{@link Features.bookmarkFolders}.
   * Specifying folder emoji requires features{@link Features.bookmarkFolderEmojis}.
   * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#post-apiv1pleromabookmark_folders}
   */
  createBookmarkFolder: async (params: CreateBookmarkFolderParams) => {
    const response = await client.request(
      client.features.version.software === PLEROMA
        ? '/api/v1/pleroma/bookmark_folders'
        : '/api/v1/bookmark_categories',
      { method: 'POST', body: { title: params.name, ...params } },
    );

    return v.parse(bookmarkFolderSchema, response.json);
  },

  /**
   * Updates a bookmark folder
   *
   * Requires features{@link Features.bookmarkFolders}.
   * Specifying folder emoji requires features{@link Features.bookmarkFolderEmojis}.
   * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#patch-apiv1pleromabookmark_foldersid}
   */
  updateBookmarkFolder: async (bookmarkFolderId: string, params: UpdateBookmarkFolderParams) => {
    const response = await client.request(
      `${client.features.version.software === PLEROMA ? '/api/v1/pleroma/bookmark_folders' : '/api/v1/bookmark_categories'}/${bookmarkFolderId}`,
      { method: 'PATCH', body: { title: params.name, ...params } },
    );

    return v.parse(bookmarkFolderSchema, response.json);
  },

  /**
   * Deletes a bookmark folder
   *
   * Requires features{@link Features.bookmarkFolders}.
   * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#delete-apiv1pleromabookmark_foldersid}
   */
  deleteBookmarkFolder: async (bookmarkFolderId: string) => {
    const response = await client.request(
      `${client.features.version.software === PLEROMA ? '/api/v1/pleroma/bookmark_folders' : '/api/v1/bookmark_categories'}/${bookmarkFolderId}`,
      { method: 'DELETE' },
    );

    return v.parse(bookmarkFolderSchema, response.json);
  },

  /**
   * Requires features{@link Features.bookmarkFoldersMultiple}.
   */
  addBookmarkToFolder: async (statusId: string, folderId: string) => {
    const response = await client.request<EmptyObject>(
      `/api/v1/bookmark_categories/${folderId}/statuses`,
      { method: 'POST', params: { status_ids: [statusId] } },
    );

    return response.json;
  },

  /**
   * Requires features{@link Features.bookmarkFoldersMultiple}.
   */
  removeBookmarkFromFolder: async (statusId: string, folderId: string) => {
    const response = await client.request<EmptyObject>(
      `/api/v1/bookmark_categories/${folderId}/statuses`,
      { method: 'DELETE', params: { status_ids: [statusId] } },
    );

    return response.json;
  },
});

export { myAccount };
