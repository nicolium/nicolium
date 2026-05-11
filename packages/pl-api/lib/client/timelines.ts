import * as v from 'valibot';

import { conversationSchema, markersSchema, statusSchema } from '@/entities';
import { ICESHRIMP_NET, PIXELFED } from '@/features';
import { paginatedIceshrimpStatusesList } from '@/utils/iceshrimp-net';

import type { statuses } from './statuses';
import type { PlApiBaseClient } from '@/client-base';
import type {
  AntennaTimelineParams,
  BubbleTimelineParams,
  GetConversationsParams,
  GroupTimelineParams,
  HashtagTimelineParams,
  HomeTimelineParams,
  LinkTimelineParams,
  ListTimelineParams,
  PublicTimelineParams,
  SaveMarkersParams,
  WrenchedTimelineParams,
} from '@/params/timelines';
import type { EmptyObject } from '@/utils/types';

const timelines = (client: PlApiBaseClient & { statuses: ReturnType<typeof statuses> }) => ({
  /**
   * View public timeline
   * View public statuses.
   * @see {@link https://docs.joinmastodon.org/methods/timelines/#public}
   */
  publicTimeline: (params?: PublicTimelineParams) =>
    params?.instance && client.features.version.software === ICESHRIMP_NET
      ? paginatedIceshrimpStatusesList(
          client,
          `/api/iceshrimp/timelines/remote/${params.instance}`,
          params,
          (response: Array<{ id: string }>) => response.map(({ id }) => id),
        )
      : client.paginatedGet('/api/v1/timelines/public', { params }, statusSchema),

  /**
   * View hashtag timeline
   * View public statuses containing the given hashtag.
   * @see {@link https://docs.joinmastodon.org/methods/timelines/#tag}
   */
  hashtagTimeline: (hashtag: string, params?: HashtagTimelineParams) =>
    client.paginatedGet(`/api/v1/timelines/tag/${hashtag}`, { params }, statusSchema),

  /**
   * View home timeline
   * View statuses from followed users and hashtags.
   * @see {@link https://docs.joinmastodon.org/methods/timelines/#home}
   */
  homeTimeline: (params?: HomeTimelineParams) =>
    client.paginatedGet('/api/v1/timelines/home', { params }, statusSchema),

  /**
   * View link timeline
   * View public statuses containing a link to the specified currently-trending article. This only lists statuses from people who have opted in to discoverability features.
   * @see {@link https://docs.joinmastodon.org/methods/timelines/#link}
   */
  linkTimeline: (url: string, params?: LinkTimelineParams) =>
    client.paginatedGet('/api/v1/timelines/link', { params: { ...params, url } }, statusSchema),

  /**
   * View list timeline
   * View statuses in the given list timeline.
   * @see {@link https://docs.joinmastodon.org/methods/timelines/#list}
   */
  listTimeline: (listId: string, params?: ListTimelineParams) =>
    client.paginatedGet(`/api/v1/timelines/list/${listId}`, { params }, statusSchema),

  /**
   * View all conversations
   * @see {@link https://docs.joinmastodon.org/methods/conversations/#get}
   */
  getConversations: (params?: GetConversationsParams) =>
    client.paginatedGet('/api/v1/conversations', { params }, conversationSchema),

  /**
   * Remove a conversation
   * Removes a conversation from your list of conversations.
   * @see {@link https://docs.joinmastodon.org/methods/conversations/#delete}
   */
  deleteConversation: async (conversationId: string) => {
    const response = await client.request<EmptyObject>(`/api/v1/conversations/${conversationId}`, {
      method: 'DELETE',
    });

    return response.json;
  },

  /**
   * Mark a conversation as read
   * @see {@link https://docs.joinmastodon.org/methods/conversations/#read}
   */
  markConversationRead: async (conversationId: string) => {
    const response = await client.request(`/api/v1/conversations/${conversationId}/read`, {
      method: 'POST',
    });

    return v.parse(conversationSchema, response.json);
  },

  /**
   * Get saved timeline positions
   * Get current positions in timelines.
   * @see {@link https://docs.joinmastodon.org/methods/markers/#get}
   */
  getMarkers: async (timelines?: string[]) => {
    const response = await client.request('/api/v1/markers', { params: { timeline: timelines } });

    return v.parse(markersSchema, response.json);
  },

  /**
   * Save your position in a timeline
   * Save current position in timeline.
   * @see {@link https://docs.joinmastodon.org/methods/markers/#create}
   */
  saveMarkers: async (params: SaveMarkersParams) => {
    const response = await client.request('/api/v1/markers', { method: 'POST', body: params });

    return v.parse(markersSchema, response.json);
  },

  /**
   * Requires features{@link Features.groups}.
   */
  groupTimeline: (groupId: string, params?: GroupTimelineParams) =>
    client.paginatedGet(
      client.features.version.software === PIXELFED
        ? `/api/v0/groups/${groupId}/feed`
        : `/api/v1/timelines/group/${groupId}`,
      { params },
      statusSchema,
    ),

  /**
   * Requires features{@link Features.bubbleTimeline}.
   */
  bubbleTimeline: (params?: BubbleTimelineParams) =>
    client.paginatedGet('/api/v1/timelines/bubble', { params }, statusSchema),

  /**
   * View antenna timeline
   * Requires features{@link Features.antennas}.
   */
  antennaTimeline: (antennaId: string, params?: AntennaTimelineParams) =>
    client.paginatedGet(`/api/v1/timelines/antenna/${antennaId}`, { params }, statusSchema),

  /**
   * Requires features{@link Features.wrenchedTimeline}.
   */
  wrenchedTimeline: (params?: WrenchedTimelineParams) =>
    client.paginatedGet('/api/v1/pleroma/timelines/wrenched', { params }, statusSchema),
});

export { timelines };
