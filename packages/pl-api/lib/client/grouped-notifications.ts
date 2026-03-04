import * as v from 'valibot';

import { accountSchema, groupedNotificationsResultsSchema } from '@/entities';
import { filteredArray } from '@/entities/utils';
import { PaginatedResponse } from '@/responses';
import { pick, omit } from '@/utils';

import type { notifications } from './notifications';
import type { PlApiBaseClient } from '@/client-base';
import type {
  Account,
  GroupedNotificationsResults,
  Notification,
  NotificationGroup,
  Status,
} from '@/entities';
import type {
  GetGroupedNotificationsParams,
  GetUnreadNotificationGroupCountParams,
} from '@/params/grouped-notifications';
import type { RequestMeta } from '@/request';
import type { EmptyObject } from '@/utils/types';

const GROUPED_TYPES = [
  'favourite',
  'reblog',
  'emoji_reaction',
  'event_reminder',
  'participation_accepted',
  'participation_request',
];

const groupNotifications = (
  { previous, next, items, ...response }: PaginatedResponse<Notification>,
  params?: GetGroupedNotificationsParams,
): PaginatedResponse<GroupedNotificationsResults, false> => {
  const notificationGroups: Array<NotificationGroup> = [];

  for (const notification of items) {
    let existingGroup: NotificationGroup | undefined;
    if ((params?.grouped_types || GROUPED_TYPES).includes(notification.type)) {
      existingGroup = notificationGroups.find(
        (notificationGroup) =>
          notificationGroup.type === notification.type &&
          (notification.type === 'emoji_reaction' && notificationGroup.type === 'emoji_reaction'
            ? notification.emoji === notificationGroup.emoji
            : true) &&
          // @ts-expect-error used optional chaining
          notificationGroup.status_id === notification.status?.id,
      );
    }

    if (existingGroup) {
      existingGroup.notifications_count += 1;
      existingGroup.page_min_id = notification.id;
      existingGroup.sample_account_ids.push(notification.account.id);
    } else {
      notificationGroups.push({
        ...omit(notification, ['account', 'status', 'target']),
        group_key: notification.id,
        notifications_count: 1,
        most_recent_notification_id: notification.id,
        page_min_id: notification.id,
        page_max_id: notification.id,
        latest_page_notification_at: notification.created_at,
        sample_account_ids: [notification.account.id],
        // @ts-expect-error used optional chaining
        status_id: notification.status?.id,
        // @ts-expect-error used optional chaining
        target_id: notification.target?.id,
      } as NotificationGroup);
    }
  }

  const groupedNotificationsResults: GroupedNotificationsResults = {
    accounts: Object.values(
      items.reduce<Record<string, Account>>((accounts, notification) => {
        accounts[notification.account.id] = notification.account;
        if ('target' in notification) accounts[notification.target.id] = notification.target;

        return accounts;
      }, {}),
    ),
    statuses: Object.values(
      items.reduce<Record<string, Status>>((statuses, notification) => {
        if ('status' in notification && notification.status)
          statuses[notification.status.id] = notification.status;
        return statuses;
      }, {}),
    ),
    notification_groups: notificationGroups,
  };

  return {
    ...response,
    previous: previous ? async () => groupNotifications(await previous(), params) : null,
    next: next ? async () => groupNotifications(await next(), params) : null,
    items: groupedNotificationsResults,
  };
};

/**
 * It is recommended to only use this with features{@link Features.groupedNotifications} available. However, there is a fallback that groups the notifications client-side.
 */
const groupedNotifications = (
  client: PlApiBaseClient & {
    notifications: ReturnType<typeof notifications>;
  },
) => {
  const category = {
    /**
     * Get all grouped notifications
     * Return grouped notifications concerning the user. This API returns Link headers containing links to the next/previous page. However, the links can also be constructed dynamically using query params and `id` values.
     *
     * Requires features{@link Features.groupedNotifications}.
     * @see {@link https://docs.joinmastodon.org/methods/grouped_notifications/#get-grouped}
     */
    getGroupedNotifications: async (params: GetGroupedNotificationsParams, meta?: RequestMeta) => {
      if (client.features.groupedNotifications) {
        return client.paginatedGet(
          '/api/v2/notifications',
          { ...meta, params },
          groupedNotificationsResultsSchema,
          false,
        );
      }

      const response = await client.notifications.getNotifications(
        pick(params, [
          'max_id',
          'since_id',
          'limit',
          'min_id',
          'types',
          'exclude_types',
          'account_id',
          'include_filtered',
        ]),
      );

      return groupNotifications(response, params);
    },

    /**
     * Get a single notification group
     * View information about a specific notification group with a given group key.
     *
     * Requires features{@link Features.groupedNotifications}.
     * @see {@link https://docs.joinmastodon.org/methods/grouped_notifications/#get-notification-group}
     */
    getNotificationGroup: async (groupKey: string) => {
      if (client.features.groupedNotifications) {
        const response = await client.request(`/api/v2/notifications/${groupKey}`);

        return v.parse(groupedNotificationsResultsSchema, response.json);
      }

      const response = await client.request(`/api/v1/notifications/${groupKey}`);

      return groupNotifications(
        new PaginatedResponse([response.json], {
          partial: false,
        }),
      ).items;
    },

    /**
     * Dismiss a single notification group
     * Dismiss a single notification group from the server.
     *
     * Requires features{@link Features.groupedNotifications}.
     * @see {@link https://docs.joinmastodon.org/methods/grouped_notifications/#dismiss-group}
     */
    dismissNotificationGroup: async (groupKey: string) => {
      if (client.features.groupedNotifications) {
        const response = await client.request<EmptyObject>(
          `/api/v2/notifications/${groupKey}/dismiss`,
          {
            method: 'POST',
          },
        );

        return response.json;
      }

      return client.notifications.dismissNotification(groupKey);
    },

    /**
     * Get accounts of all notifications in a notification group
     *
     * Requires features{@link Features.groupedNotifications}.
     * @see {@link https://docs.joinmastodon.org/methods/grouped_notifications/#get-group-accounts}
     */
    getNotificationGroupAccounts: async (groupKey: string) => {
      if (client.features.groupedNotifications) {
        const response = await client.request(`/api/v2/notifications/${groupKey}/accounts`);

        return v.parse(filteredArray(accountSchema), response.json);
      }

      return (await category.getNotificationGroup(groupKey)).accounts;
    },

    /**
     * Get the number of unread notifications
     * Get the (capped) number of unread notification groups for the current user. A notification is considered unread if it is more recent than the notifications read marker. Because the count is dependant on the parameters, it is computed every time and is thus a relatively slow operation (although faster than getting the full corresponding notifications), therefore the number of returned notifications is capped.
     *
     * Requires features{@link Features.groupedNotifications}.
     * @see {@link https://docs.joinmastodon.org/methods/grouped_notifications/#unread-group-count}
     */
    getUnreadNotificationGroupCount: async (params: GetUnreadNotificationGroupCountParams) => {
      if (client.features.groupedNotifications) {
        const response = await client.request('/api/v2/notifications/unread_count', { params });

        return v.parse(
          v.object({
            count: v.number(),
          }),
          response.json,
        );
      }

      return client.notifications.getUnreadNotificationCount(
        pick(params || {}, ['limit', 'types', 'exclude_types', 'account_id']),
      );
    },
  };
  return category;
};

export { groupedNotifications };
