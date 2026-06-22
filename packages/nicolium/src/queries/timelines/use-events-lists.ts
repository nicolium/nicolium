import { queryKeys } from '../keys';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';
import { minifyStatusList } from '../utils/minify-list';

const useRecentEventsTimeline = makePaginatedResponseQuery(
  queryKeys.statusLists.recentEvents,
  (client, _params, accountOrInstanceUrl) =>
    client.timelines
      .publicTimeline({
        only_events: true,
      })
      .then((res) => {
        res.items = res.items.filter(({ event }) => event);
        return res;
      })
      .then((response) => minifyStatusList(response, accountOrInstanceUrl)),
  undefined,
  'isLoggedIn',
  { staleTime: 5 * 60 * 1000 }, // 5 minutes
);

const useJoinedEventsTimeline = makePaginatedResponseQuery(
  queryKeys.statusLists.joinedEvents,
  (client, _params, accountOrInstanceUrl) =>
    client.events
      .getJoinedEvents()
      .then((response) => minifyStatusList(response, accountOrInstanceUrl)),
  undefined,
  'isLoggedIn',
  { staleTime: 5 * 60 * 1000 }, // 5 minutes
);

export { useRecentEventsTimeline, useJoinedEventsTimeline };
