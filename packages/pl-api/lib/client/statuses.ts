import * as v from 'valibot';

import {
  accountSchema,
  bookmarkFolderSchema,
  contextSchema,
  emojiReactionSchema,
  partialStatusSchema,
  scheduledStatusSchema,
  statusEditSchema,
  statusSchema,
  statusSourceSchema,
  translationSchema,
} from '@/entities';
import { filteredArray } from '@/entities/utils';

import { AKKOMA, ICESHRIMP_NET, MITRA, PLEROMA } from '../features';
import { getAsyncRefreshHeader } from '../request';

import type { PlApiBaseClient } from '@/client-base';
import type {
  CreateStatusParams,
  EditInteractionPolicyParams,
  EditStatusParams,
  GetFavouritedByParams,
  GetRebloggedByParams,
  GetStatusContextParams,
  GetStatusMentionedUsersParams,
  GetStatusParams,
  GetStatusQuotesParams,
  GetStatusReferencesParams,
  GetStatusesParams,
} from '@/params/statuses';
import type { EmptyObject } from '@/utils/types';

const statuses = (client: PlApiBaseClient) => {
  const category = {
    /**
     * Post a new status
     * Publish a status with the given parameters.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#create}
     */
    createStatus: async (params: CreateStatusParams) => {
      type ExtendedCreateStatusParams = CreateStatusParams & {
        markdown?: boolean;
        circle_id?: string | null;
      };

      const fixedParams: ExtendedCreateStatusParams = params;

      if (
        params.content_type === 'text/markdown' &&
        client.instanceInformation.api_versions['kmyblue_markdown.fedibird.pl-api'] >= 1
      ) {
        fixedParams.markdown = true;
      }
      if (params.visibility?.startsWith('api/v1/bookmark_categories')) {
        fixedParams.circle_id = params.visibility.slice(7);
        fixedParams.visibility = 'circle';
      }
      if (params.quote_id && client.instanceInformation.api_versions.mastodon >= 7)
        params.quoted_status_id = params.quote_id;
      else if (
        params.quoted_status_id &&
        (client.instanceInformation.api_versions.mastodon || 0) < 7
      )
        params.quote_id = params.quoted_status_id;

      const input =
        params.preview && client.features.version.software === MITRA
          ? '/api/v1/statuses/preview'
          : '/api/v1/statuses';

      const response = await client.request(input, {
        method: 'POST',
        body: fixedParams,
      });

      if (response.json?.scheduled_at) return v.parse(scheduledStatusSchema, response.json);
      return v.parse(statusSchema, response.json);
    },

    /**
     * Requires features{@link Features.createStatusPreview}.
     */
    previewStatus: async (params: CreateStatusParams) => {
      const input =
        client.features.version.software === PLEROMA || client.features.version.software === AKKOMA
          ? '/api/v1/statuses'
          : '/api/v1/statuses/preview';

      if (
        client.features.version.software === PLEROMA ||
        client.features.version.software === AKKOMA
      ) {
        params.preview = true;
      }

      const response = await client.request(input, {
        method: 'POST',
        body: params,
      });

      return v.parse(v.partial(partialStatusSchema), response.json);
    },

    /**
     * View a single status
     * Obtain information about a status.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#get}
     */
    getStatus: async (statusId: string, params?: GetStatusParams) => {
      const response = await client.request(`/api/v1/statuses/${statusId}`, { params });

      return v.parse(statusSchema, response.json);
    },

    /**
     * View multiple statuses
     * Obtain information about multiple statuses.
     *
     * Requires features{@link Features.getStatuses}.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#index}
     */
    getStatuses: async (statusIds: string[], params?: GetStatusesParams) => {
      const response = await client.request('/api/v1/statuses', {
        params: { ...params, id: statusIds },
      });

      return v.parse(filteredArray(statusSchema), response.json);
    },

    /**
     * Delete a status
     * Delete one of your own statuses.
     *
     * `delete_media` parameter requires features{@link Features.deleteMedia}.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#delete}
     */
    deleteStatus: async (statusId: string, deleteMedia?: boolean) => {
      const response = await client.request(`/api/v1/statuses/${statusId}`, {
        method: 'DELETE',
        params: { delete_media: deleteMedia },
      });

      return v.parse(statusSourceSchema, response.json);
    },

    /**
     * Get parent and child statuses in context
     * View statuses above and below this status in the thread.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#context}
     */
    getContext: async (statusId: string, params?: GetStatusContextParams) => {
      const response = await client.request(`/api/v1/statuses/${statusId}/context`, { params });

      const asyncRefreshHeader = getAsyncRefreshHeader(response);

      return { asyncRefreshHeader, ...v.parse(contextSchema, response.json) };
    },

    /**
     * Translate a status
     * Translate the status content into some language.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#translate}
     */
    translateStatus: async (statusId: string, lang?: string) => {
      let response;
      if (client.features.version.software === AKKOMA) {
        response = await client.request(`/api/v1/statuses/${statusId}/translations/${lang}`);
      } else {
        response = await client.request(`/api/v1/statuses/${statusId}/translate`, {
          method: 'POST',
          body: { lang },
        });
      }

      return v.parse(translationSchema, response.json);
    },

    /**
     * Translate multiple statuses into given language.
     *
     * Requires features{@link Features.lazyTranslations}.
     */
    translateStatuses: async (statusIds: Array<string>, lang: string) => {
      const response = await client.request('/api/v1/pl/statuses/translate', {
        method: 'POST',
        body: { ids: statusIds, lang },
      });

      return v.parse(filteredArray(translationSchema), response.json);
    },

    /**
     * See who boosted a status
     * View who boosted a given status.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#reblogged_by}
     */
    getRebloggedBy: (statusId: string, params?: GetRebloggedByParams) =>
      client.paginatedGet(`/api/v1/statuses/${statusId}/reblogged_by`, { params }, accountSchema),

    /**
     * See who favourited a status
     * View who favourited a given status.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#favourited_by}
     */
    getFavouritedBy: (statusId: string, params?: GetFavouritedByParams) =>
      client.paginatedGet(`/api/v1/statuses/${statusId}/favourited_by`, { params }, accountSchema),

    /**
     * Favourite a status
     * Add a status to your favourites list.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#favourite}
     */
    favouriteStatus: async (statusId: string) => {
      const response = await client.request(`/api/v1/statuses/${statusId}/favourite`, {
        method: 'POST',
      });

      return v.parse(statusSchema, response.json);
    },

    /**
     * Undo favourite of a status
     * Remove a status from your favourites list.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#unfavourite}
     */
    unfavouriteStatus: async (statusId: string) => {
      const response = await client.request(`/api/v1/statuses/${statusId}/unfavourite`, {
        method: 'POST',
      });

      return v.parse(statusSchema, response.json);
    },

    /**
     * Boost a status
     * Reshare a status on your own profile.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#reblog}
     *
     * Specifying reblog visibility requires features{@link Features.reblogVisibility}.
     */
    reblogStatus: async (statusId: string, visibility?: string) => {
      const response = await client.request(`/api/v1/statuses/${statusId}/reblog`, {
        method: 'POST',
        body: { visibility },
      });

      return v.parse(statusSchema, response.json);
    },

    /**
     * Undo boost of a status
     * Undo a reshare of a status.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#unreblog}
     */
    unreblogStatus: async (statusId: string) => {
      const response = await client.request(`/api/v1/statuses/${statusId}/unreblog`, {
        method: 'POST',
      });

      return v.parse(statusSchema, response.json);
    },

    /**
     * Bookmark a status
     * Privately bookmark a status.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#bookmark}
     */
    bookmarkStatus: async (statusId: string, folderId?: string) => {
      if (!client.features.bookmarkFoldersMultiple) {
        const response = await client.request(`/api/v1/statuses/${statusId}/bookmark`, {
          method: 'POST',
          body: { folder_id: folderId },
        });

        return v.parse(statusSchema, response.json);
      } else if (folderId && client.features.bookmarkFoldersMultiple) {
        await client.request(`/api/v1/bookmark_categories/${folderId}/statuses`, {
          method: 'POST',
          params: { status_ids: [statusId] },
        });
      }

      return category.getStatus(statusId);
    },

    /**
     * Undo bookmark of a status
     * Remove a status from your private bookmarks.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#unbookmark}
     */
    unbookmarkStatus: async (statusId: string) => {
      await client.request(`/api/v1/statuses/${statusId}/unbookmark`, {
        method: 'POST',
      });

      return category.getStatus(statusId);
    },

    /**
     * Revoke a quote post
     * Revoke quote authorization of status `quoting_status_id`, detaching status `id`.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#revoke_quote}
     */
    revokeQuote: async (statusId: string, quotingStatusId: string) => {
      const response = await client.request(
        `/api/v1/statuses/${statusId}/quotes/${quotingStatusId}/revoke`,
        { method: 'POST' },
      );

      return v.parse(statusSchema, response.json);
    },

    /**
     * Mute a conversation
     * Do not receive notifications for the thread that this status is part of. Must be a thread in which you are a participant.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#mute}
     */
    muteStatus: async (statusId: string) => {
      const response = await client.request(`/api/v1/statuses/${statusId}/mute`, {
        method: 'POST',
      });

      return v.parse(statusSchema, response.json);
    },

    /**
     * Unmute a conversation
     * Start receiving notifications again for the thread that this status is part of.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#unmute}
     */
    unmuteStatus: async (statusId: string) => {
      const response = await client.request(`/api/v1/statuses/${statusId}/unmute`, {
        method: 'POST',
      });

      return v.parse(statusSchema, response.json);
    },

    /**
     * Pin status to profile
     * Feature one of your own public statuses at the top of your profile.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#pin}
     */
    pinStatus: async (statusId: string) => {
      const response = await client.request(`/api/v1/statuses/${statusId}/pin`, { method: 'POST' });

      return v.parse(statusSchema, response.json);
    },

    /**
     * Unpin status from profile
     * Unfeature a status from the top of your profile.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#unpin}
     */
    unpinStatus: async (statusId: string) => {
      const response = await client.request(`/api/v1/statuses/${statusId}/unpin`, {
        method: 'POST',
      });

      return v.parse(statusSchema, response.json);
    },

    /**
     * Edit a status
     * Edit a given status to change its text, sensitivity, media attachments, or poll. Note that editing a poll’s options will reset the votes.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#edit}
     */
    editStatus: async (statusId: string, params: EditStatusParams) => {
      type ExtendedEditStatusParams = EditStatusParams & {
        markdown?: boolean;
      };

      const fixedParams: ExtendedEditStatusParams = params;

      if (
        params.content_type === 'text/markdown' &&
        client.instanceInformation.api_versions['kmyblue_markdown.fedibird.pl-api'] >= 1
      ) {
        fixedParams.markdown = true;
      }

      const response = await client.request(`/api/v1/statuses/${statusId}`, {
        method: 'PUT',
        body: fixedParams,
      });

      return v.parse(statusSchema, response.json);
    },

    /**
     * Edit a status' interaction policies
     * Edit a given status to change its interaction policies. Currently, this means changing its quote approval policy.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#edit_interaction_policy}
     */
    editInteractionPolicy: async (statusId: string, params: EditInteractionPolicyParams) => {
      const response = await client.request(`/api/v1/statuses/${statusId}`, {
        method: 'PUT',
        body: params,
      });

      return v.parse(statusSchema, response.json);
    },

    /**
     * View edit history of a status
     * Get all known versions of a status, including the initial and current states.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#history}
     */
    getStatusHistory: async (statusId: string) => {
      const response = await client.request(`/api/v1/statuses/${statusId}/history`);

      return v.parse(filteredArray(statusEditSchema), response.json);
    },

    /**
     * View status source
     * Obtain the source properties for a status so that it can be edited.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#source}
     */
    getStatusSource: async (statusId: string) => {
      const response = await client.request(`/api/v1/statuses/${statusId}/source`);

      return v.parse(statusSourceSchema, response.json);
    },

    /**
     * Get an object of emoji to account mappings with accounts that reacted to the post
     *
     * Requires features{@link Features.emojiReactsList}.
     * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#get-apiv1pleromastatusesidreactions}
     * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#get-apiv1pleromastatusesidreactionsemoji}
     */
    getStatusReactions: async (statusId: string, emoji?: string) => {
      const apiVersions = client.instanceInformation.api_versions;

      let response;
      if (
        apiVersions['emoji_reactions.pleroma.pl-api'] >= 1 ||
        client.features.version.software === ICESHRIMP_NET
      ) {
        response = await client.request(
          `/api/v1/pleroma/statuses/${statusId}/reactions${emoji ? `/${emoji}` : ''}`,
        );
      } else {
        if (apiVersions['emoji_reaction.fedibird.pl-api'] >= 1) {
          response = await client.request(`/api/v1/statuses/${statusId}/emoji_reactioned_by`);
        } else {
          response = await client.request(`/api/v1/statuses/${statusId}/reactions`, {
            params: { emoji },
          });
        }
        response.json = response.json?.reduce((acc: Array<any>, cur: any) => {
          if (emoji && cur.name !== emoji) return acc;

          const existing = acc.find((reaction) => reaction.name === cur.name);

          if (existing) {
            existing.accounts.push(cur.account);
            existing.account_ids.push(cur.account.id);
            existing.count += 1;
          } else
            acc.push({ count: 1, accounts: [cur.account], account_ids: [cur.account.id], ...cur });

          return acc;
        }, []);
      }

      return v.parse(filteredArray(emojiReactionSchema), response?.json || []);
    },

    /**
     * React to a post with a unicode emoji
     *
     * Requires features{@link Features.emojiReacts}.
     * Using custom emojis requires features{@link Features.customEmojiReacts}.
     * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#put-apiv1pleromastatusesidreactionsemoji}
     */
    createStatusReaction: async (statusId: string, emoji: string) => {
      const apiVersions = client.instanceInformation.api_versions;

      let response;
      if (
        apiVersions['emoji_reactions.pleroma.pl-api'] >= 1 ||
        client.features.version.software === MITRA
      ) {
        response = await client.request(
          `/api/v1/pleroma/statuses/${statusId}/reactions/${encodeURIComponent(emoji)}`,
          { method: 'PUT' },
        );
      } else {
        response = await client.request(
          `/api/v1/statuses/${statusId}/react/${encodeURIComponent(emoji)}`,
          { method: 'POST' },
        );
      }

      return v.parse(statusSchema, response.json);
    },

    /**
     * Remove a reaction to a post with a unicode emoji
     *
     * Requires features{@link Features.emojiReacts}.
     * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#delete-apiv1pleromastatusesidreactionsemoji}
     */
    deleteStatusReaction: async (statusId: string, emoji: string) => {
      const apiVersions = client.instanceInformation.api_versions;

      let response;
      if (
        apiVersions['emoji_reactions.pleroma.pl-api'] >= 1 ||
        client.features.version.software === MITRA
      ) {
        response = await client.request(`/api/v1/pleroma/statuses/${statusId}/reactions/${emoji}`, {
          method: 'DELETE',
        });
      } else {
        response = await client.request(
          `/api/v1/statuses/${statusId}/unreact/${encodeURIComponent(emoji)}`,
          { method: 'POST' },
        );
      }

      return v.parse(statusSchema, response.json);
    },

    /**
     * View quotes for a given status
     *
     * Requires features{@link Features.quotePosts}.
     * @see {@link https://docs.joinmastodon.org/methods/statuses/#quotes}
     */
    getStatusQuotes: (statusId: string, params?: GetStatusQuotesParams) =>
      client.paginatedGet(
        client.instanceInformation.api_versions.mastodon >= 7
          ? `/api/v1/statuses/${statusId}/quotes`
          : `/api/v1/pleroma/statuses/${statusId}/quotes`,
        { params },
        statusSchema,
      ),

    /**
     * Returns the list of accounts that have disliked the status as known by the current server
     *
     * Requires features{@link Features.statusDislikes}.
     * @see {@link https://github.com/friendica/friendica/blob/2024.06-rc/doc/API-Friendica.md#get-apifriendicastatusesiddisliked_by}
     */
    getDislikedBy: (statusId: string) =>
      client.paginatedGet(`/api/v1/statuses/${statusId}/disliked_by`, {}, accountSchema),

    /**
     * Marks the given status as disliked by this user
     * @see {@link https://github.com/friendica/friendica/blob/2024.06-rc/doc/API-Friendica.md#post-apifriendicastatusesiddislike}
     */
    dislikeStatus: async (statusId: string) => {
      const response = await client.request(`/api/friendica/statuses/${statusId}/dislike`, {
        method: 'POST',
      });

      return v.parse(statusSchema, response.json);
    },

    /**
     * Removes the dislike mark (if it exists) on this status for this user
     * @see {@link https://github.com/friendica/friendica/blob/2024.06-rc/doc/API-Friendica.md#post-apifriendicastatusesidundislike}
     */
    undislikeStatus: async (statusId: string) => {
      const response = await client.request(`/api/friendica/statuses/${statusId}/undislike`, {
        method: 'POST',
      });

      return v.parse(statusSchema, response.json);
    },

    getStatusReferences: (statusId: string, params?: GetStatusReferencesParams) =>
      client.paginatedGet(`/api/v1/statuses/${statusId}/referred_by`, { params }, statusSchema),

    getStatusMentionedUsers: (statusId: string, params?: GetStatusMentionedUsersParams) =>
      client.paginatedGet(`/api/v1/statuses/${statusId}/mentioned_by`, { params }, accountSchema),

    /**
     * Load conversation from a remote server.
     *
     * Requires features{@link Features.loadConversation}.
     */
    loadConversation: async (statusId: string) => {
      const response = await client.request<EmptyObject>(
        `/api/v1/statuses/${statusId}/load_conversation`,
        { method: 'POST' },
      );

      return response.json;
    },

    /**
     * Requires features{@link Features.bookmarkFoldersMultiple}.
     */
    getStatusBookmarkFolders: async (statusId: string) => {
      const response = await client.request(`/api/v1/statuses/${statusId}/bookmark_categories`, {
        method: 'GET',
      });

      return v.parse(filteredArray(bookmarkFolderSchema), response.json);
    },
  };

  return category;
};

export { statuses };
