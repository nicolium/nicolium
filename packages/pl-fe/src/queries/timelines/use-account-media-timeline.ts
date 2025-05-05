import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';
import { minifyStatusList } from '../utils/minify-list';

const useAccountMediaTimeline = makePaginatedResponseQuery(
  (accountId: string) => ['timelineIds', `account:${accountId}:with_replies:media`],
  (client, [accountId]) => client.accounts.getAccountStatuses(accountId!, { only_media: true }).then(minifyStatusList),
);

const useGroupMediaTimeline = makePaginatedResponseQuery(
  (groupId: string) => ['timelineIds', `group:${groupId}:media`],
  (client, [groupId]) => client.timelines.groupTimeline(groupId!, { only_media: true }).then(minifyStatusList),
);

export { useAccountMediaTimeline, useGroupMediaTimeline };
