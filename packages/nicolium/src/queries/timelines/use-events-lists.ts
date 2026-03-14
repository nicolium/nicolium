import { queryKeys } from '../keys';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';
import { minifyStatusList } from '../utils/minify-list';

const useRecentEventsTimeline = makePaginatedResponseQuery(
  queryKeys.statusLists.recentEvents,
  (client) =>
    client.timelines
      .publicTimeline({
        only_events: true,
      })
      .then((res) => {
        res.items = res.items.filter(({ event }) => event);
        return res;
      })
      .then(minifyStatusList),
  undefined,
  'isLoggedIn',
  { staleTime: 5 * 60 * 1000 }, // 5 minutes
);

const useJoinedEventsTimeline = makePaginatedResponseQuery(
  queryKeys.statusLists.joinedEvents,
  (client) => client.events.getJoinedEvents().then(minifyStatusList),
  undefined,
  'isLoggedIn',
  { staleTime: 5 * 60 * 1000 }, // 5 minutes
);

export { useRecentEventsTimeline, useJoinedEventsTimeline };
