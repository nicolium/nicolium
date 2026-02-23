import * as v from 'valibot';

import {
  notificationPolicySchema,
  notificationRequestSchema,
  notificationSchema,
} from '../entities';
import { type RequestMeta } from '../request';

import type { PlApiBaseClient } from '../client-base';
import type {
  GetNotificationParams,
  GetNotificationRequestsParams,
  GetUnreadNotificationCountParams,
  UpdateNotificationPolicyRequest,
} from '../params/notifications';

type EmptyObject = Record<string, never>;

const notifications = (client: PlApiBaseClient) => ({
  /**
   * Get all notifications
   * Notifications concerning the user. This API returns Link headers containing links to the next/previous page. However, the links can also be constructed dynamically using query params and `id` values.
   * @see {@link https://docs.joinmastodon.org/methods/notifications/#get}
   */
  getNotifications: (params?: GetNotificationParams, meta?: RequestMeta) => {
    const PLEROMA_TYPES = [
      'chat_mention',
      'emoji_reaction',
      'report',
      'participation_accepted',
      'participation_request',
      'event_reminder',
      'event_update',
    ];

    if (params?.types)
      params.types = [
        ...params.types,
        ...params.types
          .filter((type) => PLEROMA_TYPES.includes(type))
          .map((type) => `pleroma:${type}`),
      ];

    if (params?.exclude_types)
      params.exclude_types = [
        ...params.exclude_types,
        ...params.exclude_types
          .filter((type) => PLEROMA_TYPES.includes(type))
          .map((type) => `pleroma:${type}`),
      ];

    return client.paginatedGet('/api/v1/notifications', { ...meta, params }, notificationSchema);
  },

  /**
   * Get a single notification
   * View information about a notification with a given ID.
   * @see {@link https://docs.joinmastodon.org/methods/notifications/#get-one}
   */
  getNotification: async (notificationId: string) => {
    const response = await client.request(`/api/v1/notifications/${notificationId}`);

    return v.parse(notificationSchema, response.json);
  },

  /**
   * Dismiss all notifications
   * Clear all notifications from the server.
   * @see {@link https://docs.joinmastodon.org/methods/notifications/#clear}
   */
  dismissNotifications: async () => {
    const response = await client.request<EmptyObject>('/api/v1/notifications/clear', {
      method: 'POST',
    });

    return response.json;
  },

  /**
   * Dismiss a single notification
   * Dismiss a single notification from the server.
   * @see {@link https://docs.joinmastodon.org/methods/notifications/#dismiss}
   */
  dismissNotification: async (notificationId: string) => {
    const response = await client.request<EmptyObject>(
      `/api/v1/notifications/${notificationId}/dismiss`,
      {
        method: 'POST',
      },
    );

    return response.json;
  },

  /**
   * Get the number of unread notification
   * Get the (capped) number of unread notifications for the current user.
   *
   * Requires features{@link Features.notificationsGetUnreadCount}.
   * @see {@link https://docs.joinmastodon.org/methods/notifications/#unread-count}
   */
  getUnreadNotificationCount: async (params?: GetUnreadNotificationCountParams) => {
    const response = await client.request('/api/v1/notifications/unread_count', { params });

    return v.parse(
      v.object({
        count: v.number(),
      }),
      response.json,
    );
  },

  /**
   * Get the filtering policy for notifications
   * Notifications filtering policy for the user.
   *
   * Requires features{@link Features.notificationsPolicy}.
   * @see {@link https://docs.joinmastodon.org/methods/notifications/#get-policy}
   */
  getNotificationPolicy: async () => {
    const response = await client.request('/api/v2/notifications/policy');

    return v.parse(notificationPolicySchema, response.json);
  },

  /**
   * Update the filtering policy for notifications
   * Update the user’s notifications filtering policy.
   *
   * Requires features{@link Features.notificationsPolicy}.
   * @see {@link https://docs.joinmastodon.org/methods/notifications/#update-the-filtering-policy-for-notifications}
   */
  updateNotificationPolicy: async (params: UpdateNotificationPolicyRequest) => {
    const response = await client.request('/api/v2/notifications/policy', {
      method: 'PATCH',
      body: params,
    });

    return v.parse(notificationPolicySchema, response.json);
  },

  /**
   * Get all notification requests
   * Notification requests for notifications filtered by the user’s policy. This API returns Link headers containing links to the next/previous page.
   * @see {@link https://docs.joinmastodon.org/methods/notifications/#get-requests}
   */
  getNotificationRequests: (params?: GetNotificationRequestsParams) =>
    client.paginatedGet('/api/v1/notifications/requests', { params }, notificationRequestSchema),

  /**
   * Get a single notification request
   * View information about a notification request with a given ID.
   * @see {@link https://docs.joinmastodon.org/methods/notifications/#get-one-request}
   */
  getNotificationRequest: async (notificationRequestId: string) => {
    const response = await client.request(
      `/api/v1/notifications/requests/${notificationRequestId}`,
    );

    return v.parse(notificationRequestSchema, response.json);
  },

  /**
   * Accept a single notification request
   * Accept a notification request, which merges the filtered notifications from that user back into the main notification and accepts any future notification from them.
   * @see {@link https://docs.joinmastodon.org/methods/notifications/#accept-request}
   */
  acceptNotificationRequest: async (notificationRequestId: string) => {
    const response = await client.request<EmptyObject>(
      `/api/v1/notifications/requests/${notificationRequestId}/dismiss`,
      { method: 'POST' },
    );

    return response.json;
  },

  /**
   * Dismiss a single notification request
   * Dismiss a notification request, which hides it and prevent it from contributing to the pending notification requests count.
   * @see {@link https://docs.joinmastodon.org/methods/notifications/#dismiss-request}
   */
  dismissNotificationRequest: async (notificationRequestId: string) => {
    const response = await client.request<EmptyObject>(
      `/api/v1/notifications/requests/${notificationRequestId}/dismiss`,
      { method: 'POST' },
    );

    return response.json;
  },

  /**
   * Accept multiple notification requests
   * Accepts multiple notification requests, which merges the filtered notifications from those users back into the main notifications and accepts any future notification from them.
   * @see {@link https://docs.joinmastodon.org/methods/notifications/#accept-multiple-requests}
   * Requires features{@link Features.notificationsRequestsAcceptMultiple}.
   */
  acceptMultipleNotificationRequests: async (notificationRequestIds: Array<string>) => {
    const response = await client.request<EmptyObject>('/api/v1/notifications/requests/accept', {
      method: 'POST',
      body: { id: notificationRequestIds },
    });

    return response.json;
  },

  /**
   * Dismiss multiple notification requests
   * Dismiss multiple notification requests, which hides them and prevent them from contributing to the pending notification requests count.
   * @see {@link https://docs.joinmastodon.org/methods/notifications/#dismiss-multiple-requests}
   * Requires features{@link Features.notificationsRequestsAcceptMultiple}.
   */
  dismissMultipleNotificationRequests: async (notificationRequestIds: Array<string>) => {
    const response = await client.request<EmptyObject>('/api/v1/notifications/requests/dismiss', {
      method: 'POST',
      body: { id: notificationRequestIds },
    });

    return response.json;
  },

  /**
   * Check if accepted notification requests have been merged
   * Check whether accepted notification requests have been merged. Accepting notification requests schedules a background job to merge the filtered notifications back into the normal notification list. When that process has finished, the client should refresh the notifications list at its earliest convenience. This is communicated by the `notifications_merged` streaming event but can also be polled using this endpoint.
   * @see {@link https://docs.joinmastodon.org/methods/notifications/#requests-merged}
   * Requires features{@link Features.notificationsRequestsAcceptMultiple}.
   */
  checkNotificationRequestsMerged: async () => {
    const response = await client.request('/api/v1/notifications/requests/merged');

    return v.parse(
      v.object({
        merged: v.boolean(),
      }),
      response.json,
    );
  },

  /**
   * An endpoint to delete multiple statuses by IDs.
   *
   * Requires features{@link Features.notificationsDismissMultiple}.
   * @see {@link https://docs.pleroma.social/backend/development/API/differences_in_mastoapi_responses/#delete-apiv1notificationsdestroy_multiple}
   */
  dismissMultipleNotifications: async (notificationIds: string[]) => {
    const response = await client.request<EmptyObject>('/api/v1/notifications/destroy_multiple', {
      params: { ids: notificationIds },
      method: 'DELETE',
    });

    return response.json;
  },
});

export { notifications };
