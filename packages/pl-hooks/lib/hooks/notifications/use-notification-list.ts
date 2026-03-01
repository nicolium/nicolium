import { InfiniteData, useInfiniteQuery, UseInfiniteQueryResult } from '@tanstack/react-query';

import { usePlHooksApiClient } from '@/contexts/api-client';
import { queryClient, usePlHooksQueryClient } from '@/contexts/query-client';
import { importEntities } from '@/importer';
import { deduplicateNotifications } from '@/normalizers/notification';
import { flattenPages } from '@/utils/queries';

import type { Notification as BaseNotification, PaginatedResponse, PlApiClient } from 'pl-api';

type UseNotificationParams = {
  types?: Array<BaseNotification['type']>;
  excludeTypes?: Array<BaseNotification['type']>;
};

const getQueryKey = (params: UseNotificationParams) => [
  'notifications',
  'lists',
  params.types
    ? params.types.join('|')
    : params.excludeTypes
      ? 'exclude:' + params.excludeTypes.join('|')
      : 'all',
];

const importNotifications = (response: PaginatedResponse<BaseNotification>) => {
  const deduplicatedNotifications = deduplicateNotifications(response.items);

  importEntities({
    notifications: deduplicatedNotifications,
  });

  return {
    items: deduplicatedNotifications.filter(({ duplicate }) => !duplicate).map(({ id }) => id),
    previous: response.previous,
    next: response.next,
  };
};

const useNotificationList = (
  params: UseNotificationParams,
): Omit<
  UseInfiniteQueryResult<
    InfiniteData<
      {
        items: string[];
        previous: (() => Promise<PaginatedResponse<BaseNotification>>) | null;
        next: (() => Promise<PaginatedResponse<BaseNotification>>) | null;
      },
      unknown
    >,
    Error
  >,
  'data'
> & { data: string[] } => {
  const { client } = usePlHooksApiClient();
  const queryClient = usePlHooksQueryClient();

  const notificationsQuery = useInfiniteQuery(
    {
      queryKey: getQueryKey(params),
      queryFn: ({ pageParam }) =>
        (pageParam.next
          ? pageParam.next()
          : client.notifications.getNotifications({
              types: params.types,
              exclude_types: params.excludeTypes,
            })
        ).then(importNotifications),
      initialPageParam: { next: null as (() => Promise<PaginatedResponse<BaseNotification>>) | null },
      getNextPageParam: (response) => response,
    },
    queryClient,
  );

  const data: string[] = flattenPages<string>(notificationsQuery.data) || [];

  return {
    ...notificationsQuery,
    data,
  };
};

const prefetchNotifications = (client: PlApiClient, params: UseNotificationParams) =>
  queryClient.prefetchInfiniteQuery({
    queryKey: getQueryKey(params),
    queryFn: () =>
      client.notifications
        .getNotifications({
          types: params.types,
          exclude_types: params.excludeTypes,
        })
        .then(importNotifications),
    initialPageParam: { next: null as (() => Promise<PaginatedResponse<BaseNotification>>) | null },
  });

export { useNotificationList, prefetchNotifications };
