import { useMutation, useQueryClient } from '@tanstack/react-query';
import 'intl-pluralrules';
import omit from 'lodash/omit';
import {
  PaginatedResponse,
  type GetGroupedNotificationsParams,
  type Notification,
  type NotificationGroup,
} from 'pl-api';
import { useCallback, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';

import { getNotificationStatusId, notificationMessages } from '@/components/notification';
import { useCurrentAccountContext } from '@/contexts/current-account-context';
import { useClient } from '@/hooks/use-client';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { appendFollowRequest } from '@/queries/accounts/use-follow-requests';
import { queryClient } from '@/queries/client';
import { useAppInfiniteQuery } from '@/queries/query';
import { useImportEntities } from '@/queries/utils/import-entities';
import { makePaginatedResponseQueryOptions } from '@/queries/utils/make-paginated-response-query-options';
import { useSettingsStore } from '@/stores/settings';
import { compareId } from '@/utils/comparators';
import { regexFromFilters } from '@/utils/filters';
import { unescapeHTML } from '@/utils/html';
import { EXCLUDE_TYPES, NOTIFICATION_TYPES } from '@/utils/notification';
import { play, soundCache } from '@/utils/sounds';
import { joinPublicPath } from '@/utils/static';

import { useAccount } from '../accounts/use-account';
import { useAccounts } from '../accounts/use-accounts';
import { queryKeys } from '../keys';
import { useNotificationsMarker } from '../markers/use-markers';
import { useFiltersByContext } from '../settings/use-filters';
import { useStatus } from '../statuses/use-status';
import { minifyGroupedNotifications } from '../utils/minify-list';

const FILTER_TYPES = {
  all: undefined,
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

const useActiveFilter = () =>
  useSettingsStore((state) => state.settings.notifications.quickFilter.active);

const useHideBotNotifications = () =>
  useSettingsStore((state) => state.settings.notifications.hideBots);

const excludeTypesFromFilter = (filters: string[]) =>
  NOTIFICATION_TYPES.filter((item) => !filters.includes(item)) as string[];

const buildNotificationsParams = (
  activeFilter: FilterType,
  notificationsIncludeTypes: boolean,
): GetGroupedNotificationsParams => {
  const params: GetGroupedNotificationsParams = {};

  if (activeFilter === 'all') {
    if (notificationsIncludeTypes) {
      const excludedTypes = new Set<string>(EXCLUDE_TYPES);
      params.types = NOTIFICATION_TYPES.filter((type) => !excludedTypes.has(type));
    } else {
      params.exclude_types = [...EXCLUDE_TYPES];
    }

    return params;
  }

  const filtered = [...(FILTER_TYPES[activeFilter] || [activeFilter])];

  if (notificationsIncludeTypes) {
    params.types = filtered;
  } else {
    params.exclude_types = excludeTypesFromFilter(filtered);
  }

  return params;
};

const shouldDisplayNotification = (
  notificationType: Notification['type'],
  activeFilter: FilterType,
) => {
  if (activeFilter === 'all') return true;

  const allowedTypes = [...(FILTER_TYPES[activeFilter] ?? [notificationType])] as string[];

  return allowedTypes.includes(notificationType);
};

const notificationsQueryOptions = makePaginatedResponseQueryOptions(
  (activeFilter: FilterType, hideBots: boolean) =>
    queryKeys.notifications.list(activeFilter, hideBots),
  (client, [activeFilter, hideBots], accountOrInstanceUrl) =>
    client.groupedNotifications
      .getGroupedNotifications(
        buildNotificationsParams(activeFilter, client.features.notificationsIncludeTypes),
      )
      .then((response) => minifyGroupedNotifications(response, hideBots, accountOrInstanceUrl)),
);

const useNotifications = (activeFilter: FilterType) => {
  const meUrl = useCurrentAccountContext().meUrl!;
  const client = useClient();
  const hideBots = useHideBotNotifications();

  return useAppInfiniteQuery({
    ...notificationsQueryOptions(client, activeFilter, hideBots, meUrl),
    enabled: !!meUrl,
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
  const intl = useIntl();
  const { data: filters = [] } = useFiltersByContext('notifications');
  const activeFilter = useActiveFilter();
  const { sounds } = useSettingsStore((state) => state.settings.notifications);
  const hideBots = useHideBotNotifications();
  const importEntities = useImportEntities();

  const processStreamNotification = useCallback(
    (notification: Notification) => {
      if (!notification.type) return;
      if (notification.type === 'chat_mention') return;
      if (hideBots && notification.account.bot) return;

      const playSound = sounds[notification.type];
      const status = 'status' in notification ? notification.status : null;

      let filtered: boolean | null = false;

      if (notification.type === 'mention' || notification.type === 'status') {
        const regex = regexFromFilters(filters);
        const searchIndex =
          notification.status.spoiler_text + '\n' + unescapeHTML(notification.status.content);
        filtered = regex && regex.test(searchIndex);
      }

      try {
        const isNotificationsEnabled = window.Notification?.permission === 'granted';

        if (!filtered && isNotificationsEnabled) {
          const targetName = notification.type === 'move' ? notification.target.acct : '';
          const isReblog = status?.reblog ? 1 : 0;

          const title = intl.formatMessage(notificationMessages[notification.type], {
            name: notification.account.display_name,
            targetName,
            isReblog,
          });
          const body =
            status && status.spoiler_text.length > 0
              ? status.spoiler_text
              : unescapeHTML(status ? status.content : '');

          navigator.serviceWorker.ready
            .then((serviceWorkerRegistration) => {
              serviceWorkerRegistration
                .showNotification(title, {
                  body,
                  icon: notification.account.avatar,
                  tag: notification.id,
                  data: {
                    url: joinPublicPath('/notifications'),
                  },
                })
                .catch(console.error);
            })
            .catch(console.error);
        }
      } catch (error) {
        console.warn(error);
      }

      if (playSound && !filtered) {
        play(soundCache.boop);
      }

      importEntities({
        accounts: [
          notification.account,
          notification.type === 'move' ? notification.target : undefined,
        ],
        statuses: [status],
      });

      const normalizedNotification = normalizeNotification(notification);

      prependNotification(normalizedNotification, 'all');

      if (shouldDisplayNotification(notification.type, activeFilter)) {
        prependNotification(normalizedNotification, activeFilter);
      }

      if (normalizedNotification.type === 'follow_request') {
        normalizedNotification.sample_account_ids.forEach(appendFollowRequest);
      }
    },
    [filters, sounds, activeFilter, hideBots],
  );

  return processStreamNotification;
};

const useMarkNotificationsReadMutation = () => {
  const client = useClient();

  return useMutation({
    mutationKey: ['markers', 'notifications', 'save'],
    mutationFn: async (lastReadId?: string | null) => {
      if (!lastReadId) return;

      const currentMarker = queryClient.getQueryData(queryKeys.markers.timeline('notifications'));
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
          queryKeys.markers.timeline('notifications'),
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
  const { data: marker } = useNotificationsMarker();
  const { data: notifications = [] } = useNotifications('all');

  return countUnreadNotifications(notifications, marker?.last_read_id);
};

const usePrefetchNotifications = () => {
  const queryClient = useQueryClient();
  const client = useClient();
  const { me } = useLoggedIn();
  const meUrl = useCurrentAccountContext().meUrl!;
  const activeFilter = useActiveFilter();
  const hideBots = useHideBotNotifications();

  useEffect(() => {
    if (!me) return;
    queryClient.prefetchInfiniteQuery(
      notificationsQueryOptions(client, activeFilter, hideBots, meUrl),
    );
  }, [me, hideBots]);
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

const prependNotification = (notification: NotificationGroup, filter: FilterType) => {
  for (const hideBots of [false, true]) {
    queryClient.setQueryData(queryKeys.notifications.list(filter, hideBots), (data) => {
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
    });
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
};
