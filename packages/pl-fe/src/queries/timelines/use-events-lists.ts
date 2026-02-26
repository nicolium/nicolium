import { useInfiniteQuery } from '@tanstack/react-query';

import { queryKeys } from '../keys';
import { makePaginatedResponseQueryOptions } from '../utils/make-paginated-response-query-options';
import { minifyStatusList } from '../utils/minify-list';

const recentEventsQueryOptions = makePaginatedResponseQueryOptions(
  queryKeys.statusLists.recentEvents,
  (client) =>
    client.timelines
      .publicTimeline({
        only_events: true,
      })
      .then((res) => ({
        ...res,
        items: res.items.filter(({ event }) => event),
      }))
      .then(minifyStatusList),
)();

const useRecentEventsTimeline = () =>
  useInfiniteQuery({
    ...recentEventsQueryOptions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

const joinedEventsQueryOptions = makePaginatedResponseQueryOptions(
  queryKeys.statusLists.joinedEvents,
  (client) => client.events.getJoinedEvents().then(minifyStatusList),
)();

const useJoinedEventsTimeline = () =>
  useInfiniteQuery({
    ...joinedEventsQueryOptions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export { useRecentEventsTimeline, useJoinedEventsTimeline };
