import { useMutation, useQueryClient } from '@tanstack/react-query';
import 'intl-pluralrules';
import { omit } from 'lodash-es';
import {
  PaginatedResponse,
  type GetGroupedNotificationsParams,
  type Notification,
  type NotificationGroup,
} from 'pl-api';
import { useCallback, useEffect, useMemo } from 'react';

import { useClient } from '@/contexts/current-account-context';
import { useScopeUrl } from '@/hooks/use-scope-url';
// import { appendFollowRequest } from '@/queries/accounts/use-follow-requests';
import { queryClient } from '@/queries/client';
import { scopedQueryKey, useAppInfiniteQuery } from '@/queries/query';
import { useImportEntities } from '@/queries/utils/import-entities';
import { makePaginatedResponseQueryOptions } from '@/queries/utils/make-paginated-response-query-options';
import { useSetting } from '@/stores/settings';
import { compareId } from '@/utils/comparators';
import { EXCLUDE_TYPES, NOTIFICATION_TYPES } from '@/utils/notification';

import { useAccount } from '../accounts/use-account';
import { useAccounts } from '../accounts/use-accounts';
import { queryKeys } from '../keys';
import { useNotificationsMarker } from '../markers/use-markers';
import { useFiltersByContext } from '../settings/use-filters';
import { useStatus } from '../statuses/use-status';
import { minifyGroupedNotifications } from '../utils/minify-list';

const getNotificationStatusId = (n: Notification) => {
  if (
    [
      'mention',
      'status',
      'reblog',
      'favourite',
      'poll',
      'update',
      'emoji_reaction',
      'event_reminder',
      'participation_accepted',
      'participation_request',
    ].includes(n.type)
  )
    // @ts-ignore
    return n.status_id;
  return null;
};

const FILTER_TYPES = {
  mention: ['mention', 'quote'],
  favourite: ['favourite', 'emoji_reaction', 'reaction'],
  reblog: ['reblog'],
  poll: ['poll'],
  status: ['status'],
  follow: ['follow', 'follow_request'],
  events: ['event_reminder', 'participation_request', 'participation_accepted'],
} as const;

type FilterType = keyof typeof FILTER_TYPES;

const normalizeNotification = (notification: Notification): NotificationGroup => {
  const base = {
    ...omit(notification, ['account', 'status', 'target']),
    group_key: notification.id,
    notifications_count: 1,
    most_recent_notification_id: notification.id,
    page_min_id: notification.id,
    page_max_id: notification.id,
    latest_page_notification_at: notification.created_at,
    sample_account_ids: [notification.account.id],
  };

  return Object.assign(base, {
    status_id: 'status' in notification ? notification.status?.id : undefined,
    target_id: 'target' in notification ? notification.target?.id : undefined,
  }) as NotificationGroup;
};

const useNotificationFilters = () => useSetting('notifications.filters');

const useHideBotNotifications = () => useSetting('notifications.hideBots');

const excludeTypesFromFilter = (filters: string[]) =>
  NOTIFICATION_TYPES.filter((item) => !filters.includes(item)) as string[];

const buildNotificationsParams = (
  activeFilters: Array<FilterType>,
  notificationsIncludeTypes: boolean,
): GetGroupedNotificationsParams => {
  const params: GetGroupedNotificationsParams = {};

  if (!activeFilters.length) {
    if (notificationsIncludeTypes) {
      const excludedTypes = new Set<string>(EXCLUDE_TYPES);
      params.types = NOTIFICATION_TYPES.filter((type) => !excludedTypes.has(type));
    } else {
      params.exclude_types = [...EXCLUDE_TYPES];
    }

    return params;
  }

  const filtered = activeFilters.map((filter) => FILTER_TYPES[filter] || filter).flat();

  if (notificationsIncludeTypes) {
    params.types = filtered;
  } else {
    params.exclude_types = excludeTypesFromFilter(filtered);
  }

  return params;
};

const shouldDisplayNotification = (
  notificationType: Notification['type'],
  activeFilters: Array<FilterType>,
) => {
  if (!activeFilters.length) return true;

  const allowedTypes = activeFilters.map((filter) => FILTER_TYPES[filter] || filter).flat();

  return allowedTypes.includes(notificationType);
};

const notificationsQueryOptions = makePaginatedResponseQueryOptions(
  (activeFilters: Array<FilterType>, hideBots: boolean) =>
    queryKeys.notifications.list(activeFilters, hideBots),
  (client, [activeFilters, hideBots], scopeUrl) =>
    client.groupedNotifications
      .getGroupedNotifications(
        buildNotificationsParams(activeFilters, client.features.notificationsIncludeTypes),
      )
      .then((response) => minifyGroupedNotifications(response, hideBots, scopeUrl)),
);

const useNotifications = (activeFilters: Array<FilterType>, enabled = true) => {
  const scopeUrl = useScopeUrl();
  const client = useClient();
  const hideBots = useHideBotNotifications();

  return useAppInfiniteQuery({
    ...notificationsQueryOptions(client, activeFilters, hideBots, scopeUrl),
    enabled,
  });
};

const useNotification = (notification: NotificationGroup) => {
  const statusId = getNotificationStatusId(notification);
  const { data: status } = useStatus(statusId ?? undefined);
  const { data: target } = useAccount(
    'target_id' in notification ? notification.target_id : undefined,
  );
  const accounts = useAccounts(notification.sample_account_ids);

  return useMemo(() => {
    return {
      ...notification,
      status,
      target,
      accounts: accounts.data,
    };
  }, [notification, status, target, accounts.data]);
};

const useProcessStreamNotification = () => {
  const { data: filters = [] } = useFiltersByContext('notifications');
  const activeFilters = useNotificationFilters();
  const hideBots = useHideBotNotifications();
  const importEntities = useImportEntities();
  const scopeUrl = useScopeUrl();

  const processStreamNotification = useCallback(
    (notification: Notification) => {
      if (!notification.type) return;

      if (notification.type === 'chat_mention') return;
      if (hideBots && notification.account.bot) return;

      const status = 'status' in notification ? notification.status : null;

      importEntities({
        accounts: [
          notification.account,
          notification.type === 'move' ? notification.target : undefined,
        ],
        statuses: [status],
      });

      const normalizedNotification = normalizeNotification(notification);

      prependNotification(normalizedNotification, [], scopeUrl, notification.account.bot);

      if (shouldDisplayNotification(notification.type, activeFilters)) {
        prependNotification(
          normalizedNotification,
          activeFilters,
          scopeUrl,
          notification.account.bot,
        );
      }

      // if (normalizedNotification.type === 'follow_request') {
      //   normalizedNotification.sample_account_ids.forEach((accountId) =>
      //     appendFollowRequest(accountId, scopeUrl),
      //   );
      // }
    },
    [filters, activeFilters, hideBots],
  );

  return processStreamNotification;
};

const useMarkNotificationsReadMutation = () => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['markers', 'notifications', 'save'],
    mutationFn: async (lastReadId?: string | null) => {
      if (!lastReadId) return;

      const currentMarker = queryClient.getQueryData(
        scopedQueryKey(queryKeys.markers.timeline('notifications'), scopeUrl),
      );
      if (currentMarker && compareId(currentMarker.last_read_id, lastReadId) >= 0) {
        return;
      }

      return await client.timelines.saveMarkers({
        notifications: {
          last_read_id: lastReadId,
        },
      });
    },
    onSuccess: (markers) => {
      if (markers?.notifications) {
        queryClient.setQueryData(
          scopedQueryKey(queryKeys.markers.timeline('notifications'), scopeUrl),
          markers.notifications,
        );
      }
    },
  });
};

const countUnreadNotifications = (
  notifications: NotificationGroup[],
  lastReadId?: string | null,
) => {
  if (!lastReadId) return notifications.length;

  return notifications.reduce((count, notification) => {
    if (compareId(notification.most_recent_notification_id, lastReadId) > 0) {
      return count + 1;
    }

    return count;
  }, 0);
};

const useNotificationsUnreadCount = () => {
  const { data: marker, isError } = useNotificationsMarker();
  const { data: notifications = [] } = useNotifications([]);

  return useMemo(
    () => (!marker ? 0 : countUnreadNotifications(notifications, marker?.last_read_id)),
    [notifications, marker?.last_read_id, isError],
  );
};

const usePrefetchNotifications = () => {
  const queryClient = useQueryClient();
  const client = useClient();
  const activeFilters = useNotificationFilters();
  const hideBots = useHideBotNotifications();
  const scopeUrl = useScopeUrl();

  useEffect(() => {
    queryClient.prefetchInfiniteQuery(
      notificationsQueryOptions(client, activeFilters, hideBots, scopeUrl),
    );
  }, [hideBots, client, activeFilters]);
};

const filterUnique = (
  notification: NotificationGroup,
  index: number,
  notifications: Array<NotificationGroup>,
) => notifications.findIndex(({ group_key }) => group_key === notification.group_key) === index;

// For sorting the notifications
const comparator = (
  a: Pick<NotificationGroup, 'most_recent_notification_id'>,
  b: Pick<NotificationGroup, 'most_recent_notification_id'>,
) => {
  const length = Math.max(
    a.most_recent_notification_id.length,
    b.most_recent_notification_id.length,
  );
  return b.most_recent_notification_id
    .padStart(length, '0')
    .localeCompare(a.most_recent_notification_id.padStart(length, '0'));
};

const prependNotification = (
  notification: NotificationGroup,
  filters: Array<FilterType>,
  scopeUrl: string,
  isBot = false,
) => {
  for (const hideBots of [false, true]) {
    if (hideBots && isBot) continue;

    queryClient.setQueryData(
      scopedQueryKey(queryKeys.notifications.list(filters, hideBots), scopeUrl),
      (data) => {
        if (!data || !data.pages.length) return data;

        const [firstPage, ...restPages] = data.pages;

        return {
          ...data,
          pages: [
            new PaginatedResponse<Array<NotificationGroup>, false>(
              [notification, ...firstPage.items].toSorted(comparator).filter(filterUnique),
              firstPage,
            ),
            ...restPages,
          ],
        };
      },
    );
  }
};

export {
  type FilterType,
  useMarkNotificationsReadMutation,
  useNotifications,
  useNotification,
  useNotificationsUnreadCount,
  usePrefetchNotifications,
  useProcessStreamNotification,
  normalizeNotification,
};
