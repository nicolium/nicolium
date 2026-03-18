import * as v from 'valibot';

import { accountSchema, statusSchema } from '@/entities';

import type { PlApiBaseClient } from '@/client-base';
import type {
  CreateEventParams,
  EditEventParams,
  GetEventParticipationRequestsParams,
  GetEventParticipationsParams,
  GetJoinedEventsParams,
} from '@/params/events';

const events = (client: PlApiBaseClient) => ({
  /**
   * Creates an event
   * @see {@link https://codeberg.org/mkljczk/nicolex/src/branch/develop/docs/development/API/pleroma_api.md#api-v1-pleroma-events}
   */
  createEvent: async (params: CreateEventParams) => {
    const response = await client.request('/api/v1/pleroma/events', {
      method: 'POST',
      body: params,
    });

    return v.parse(statusSchema, response.json);
  },

  /**
   * Edits an event
   * @see {@link https://codeberg.org/mkljczk/nicolex/src/branch/develop/docs/development/API/pleroma_api.md#api-v1-pleroma-events-id}
   */
  editEvent: async (statusId: string, params: EditEventParams) => {
    const response = await client.request(`/api/v1/pleroma/events/${statusId}`, {
      method: 'PUT',
      body: params,
    });

    return v.parse(statusSchema, response.json);
  },

  /**
   * Gets user's joined events
   * @see {@link https://codeberg.org/mkljczk/nicolex/src/branch/develop/docs/development/API/pleroma_api.md#api-v1-pleroma-events-joined_events}
   */
  getJoinedEvents: (state?: 'pending' | 'reject' | 'accept', params?: GetJoinedEventsParams) =>
    client.paginatedGet(
      '/api/v1/pleroma/events/joined_events',
      { params: { ...params, state } },
      statusSchema,
    ),

  /**
   * Gets event participants
   * @see {@link https://codeberg.org/mkljczk/nicolex/src/branch/develop/docs/development/API/pleroma_api.md#api-v1-pleroma-events-id-participations}
   */
  getEventParticipations: (statusId: string, params?: GetEventParticipationsParams) =>
    client.paginatedGet(
      `/api/v1/pleroma/events/${statusId}/participations`,
      { params },
      accountSchema,
    ),

  /**
   * Gets event participation requests
   * @see {@link https://codeberg.org/mkljczk/nicolex/src/branch/develop/docs/development/API/pleroma_api.md#api-v1-pleroma-events-id-participation_requests}
   */
  getEventParticipationRequests: (statusId: string, params?: GetEventParticipationRequestsParams) =>
    client.paginatedGet(
      `/api/v1/pleroma/events/${statusId}/participation_requests`,
      { params },
      v.object({
        account: accountSchema,
        participation_message: v.fallback(v.string(), ''),
      }),
    ),

  /**
   * Accepts user to the event
   * @see {@link https://codeberg.org/mkljczk/nicolex/src/branch/develop/docs/development/API/pleroma_api.md#api-v1-pleroma-events-id-participation_requests-participant_id-authorize}
   */
  acceptEventParticipationRequest: async (statusId: string, accountId: string) => {
    const response = await client.request(
      `/api/v1/pleroma/events/${statusId}/participation_requests/${accountId}/authorize`,
      { method: 'POST' },
    );

    return v.parse(statusSchema, response.json);
  },

  /**
   * Rejects user from the event
   * @see {@link https://codeberg.org/mkljczk/nicolex/src/branch/develop/docs/development/API/pleroma_api.md#api-v1-pleroma-events-id-participation_requests-participant_id-reject}
   */
  rejectEventParticipationRequest: async (statusId: string, accountId: string) => {
    const response = await client.request(
      `/api/v1/pleroma/events/${statusId}/participation_requests/${accountId}/reject`,
      { method: 'POST' },
    );

    return v.parse(statusSchema, response.json);
  },

  /**
   * Joins the event
   * @see {@link https://codeberg.org/mkljczk/nicolex/src/branch/develop/docs/development/API/pleroma_api.md#api-v1-pleroma-events-id-join}
   */
  joinEvent: async (statusId: string, participation_message?: string) => {
    const response = await client.request(`/api/v1/pleroma/events/${statusId}/join`, {
      method: 'POST',
      body: { participation_message },
    });

    return v.parse(statusSchema, response.json);
  },

  /**
   * Leaves the event
   * @see {@link https://codeberg.org/mkljczk/nicolex/src/branch/develop/docs/development/API/pleroma_api.md#api-v1-pleroma-events-id-leave}
   */
  leaveEvent: async (statusId: string) => {
    const response = await client.request(`/api/v1/pleroma/events/${statusId}/leave`, {
      method: 'POST',
    });

    return v.parse(statusSchema, response.json);
  },

  /**
   * Event ICS file
   * @see {@link https://codeberg.org/mkljczk/nicolex/src/branch/develop/docs/development/API/pleroma_api.md#event-ics-file}
   */
  getEventIcs: async (statusId: string) => {
    const response = await client.request(`/api/v1/pleroma/events/${statusId}/ics`, {
      formData: true,
    });

    return response.data;
  },
});

export { events };
