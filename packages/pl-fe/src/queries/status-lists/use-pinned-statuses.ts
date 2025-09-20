import { makePaginatedResponseQuery } from 'pl-fe/queries/utils/make-paginated-response-query';
import { minifyStatusList } from 'pl-fe/queries/utils/minify-list';

const usePinnedStatuses = makePaginatedResponseQuery(
  (accountId: string) => ['statusLists', 'pins', accountId],
  (client, [accountId]) => client.accounts.getAccountStatuses(accountId as string, { pinned: true }).then(minifyStatusList),
  undefined,
  (accountId: string) => !!accountId,
);

export { usePinnedStatuses };
