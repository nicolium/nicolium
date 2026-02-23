import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import 'intl-pluralrules';
import { useCallback, useEffect } from 'react';
import { useIntl } from 'react-intl';

import { importEntities } from '@/actions/importer';
import {
  getNotificationStatus,
  notificationMessages,
} from '@/features/notifications/components/notification';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useClient } from '@/hooks/use-client';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { normalizeNotification } from '@/normalizers/notification';
import { appendFollowRequest } from '@/queries/accounts/use-follow-requests';
import { queryClient } from '@/queries/client';
import { makePaginatedResponseQueryOptions } from '@/queries/utils/make-paginated-response-query-options';
import { getFilters, regexFromFilters } from '@/selectors';
import { useSettingsStore } from '@/stores/settings';
import { compareId } from '@/utils/comparators';
import { unescapeHTML } from '@/utils/html';
import { EXCLUDE_TYPES, NOTIFICATION_TYPES } from '@/utils/notification';
import { play, soundCache } from '@/utils/sounds';
import { joinPublicPath } from '@/utils/static';

import { minifyGroupedNotifications } from '../utils/minify-list';

import type {
  GetGroupedNotificationsParams,
  Notification,
  NotificationGroup,
  PaginatedResponse,
} from 'pl-api';

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

const useActiveFilter = () =>
  useSettingsStore((state) => state.settings.notifications.quickFilter.active);

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
  (activeFilter: FilterType) => ['notifications', activeFilter],
  (client, [activeFilter]) =>
    client.groupedNotifications
      .getGroupedNotifications(
        buildNotificationsParams(activeFilter, client.features.notificationsIncludeTypes),
      )
      .then(minifyGroupedNotifications),
);

const useNotifications = (activeFilter: FilterType) => {
  const { me } = useLoggedIn();

  return useInfiniteQuery({
    ...notificationsQueryOptions(activeFilter),
    enabled: !!me,
  });
};

const useNotificationsMarker = () => {
  const client = useClient();
  const { me } = useLoggedIn();

  return useQuery({
    queryKey: ['markers', 'notifications'],
    queryFn: async () =>
      (await client.timelines.getMarkers(['notifications'])).notifications ?? null,
    enabled: !!me,
  });
};

const usePrefetchNotificationsMarker = () => {
  const client = useClient();
  const queryClient = useQueryClient();
  const { me } = useLoggedIn();

  useEffect(() => {
    if (!me) return;
    queryClient.prefetchQuery({
      queryKey: ['markers', 'notifications'],
      queryFn: async () =>
        (await client.timelines.getMarkers(['notifications'])).notifications ?? null,
    });
  }, [me]);
};

const useProcessStreamNotification = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const filters = useAppSelector((state) => getFilters(state, { contextType: 'notifications' }));
  const activeFilter = useActiveFilter();
  const { sounds } = useSettingsStore((state) => state.settings.notifications);

  const processStreamNotification = useCallback(
    (notification: Notification, intlMessages: Record<string, string>, intlLocale: string) => {
      if (!notification.type) return;
      if (notification.type === 'chat_mention') return;

      const playSound = sounds[notification.type];
      const status = getNotificationStatus(notification);

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
          const isReblog = status?.reblog_id ? 1 : 0;

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

      dispatch(
        importEntities({
          accounts: [
            notification.account,
            notification.type === 'move' ? notification.target : undefined,
          ],
          statuses: [status],
        }),
      );

      const normalizedNotification = normalizeNotification(notification);

      prependNotification(normalizedNotification, 'all');

      if (shouldDisplayNotification(notification.type, activeFilter)) {
        prependNotification(normalizedNotification, activeFilter);
      }

      if (normalizedNotification.type === 'follow_request') {
        normalizedNotification.sample_account_ids.forEach(appendFollowRequest);
      }
    },
    [filters, sounds, activeFilter],
  );

  return processStreamNotification;
};

const useMarkNotificationsReadMutation = () => {
  const client = useClient();

  return useMutation({
    mutationKey: ['markers', 'notifications', 'save'],
    mutationFn: async (lastReadId?: string | null) => {
      if (!lastReadId) return;

      return await client.timelines.saveMarkers({
        notifications: {
          last_read_id: lastReadId,
        },
      });
    },
    onSuccess: (markers, lastReadId) => {
      if (markers?.notifications) {
        queryClient.setQueryData(['markers', 'notifications'], markers.notifications);
        return;
      }

      if (!lastReadId) return;

      queryClient.setQueryData(['markers', 'notifications'], (marker) => {
        if (!marker) return undefined;
        return {
          ...marker,
          last_read_id: lastReadId,
        };
      });
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
  const { me } = useLoggedIn();
  const activeFilter = useActiveFilter();

  useEffect(() => {
    if (!me) return;
    queryClient.prefetchInfiniteQuery(notificationsQueryOptions(activeFilter));
  }, [me]);
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
  queryClient.setQueryData<InfiniteData<PaginatedResponse<NotificationGroup>>>(
    ['notifications', filter],
    (data) => {
      if (!data || !data.pages.length) return data;

      const [firstPage, ...restPages] = data.pages;

      return {
        ...data,
        pages: [
          {
            ...firstPage,
            items: [notification, ...firstPage.items].toSorted(comparator).filter(filterUnique),
          },
          ...restPages,
        ],
      };
    },
  );
};

export {
  FILTER_TYPES,
  type FilterType,
  useMarkNotificationsReadMutation,
  useNotifications,
  useNotificationsMarker,
  useNotificationsUnreadCount,
  usePrefetchNotifications,
  usePrefetchNotificationsMarker,
  useProcessStreamNotification,
};
