import { makePaginatedResponseQuery } from '@/queries/utils/make-paginated-response-query';
import { minifyStatusList } from '@/queries/utils/minify-list';

import { queryKeys } from '../keys';

const usePinnedStatuses = makePaginatedResponseQuery(
  (accountId: string) => queryKeys.statusLists.pins(accountId),
  (client, [accountId]) =>
    client.accounts.getAccountStatuses(accountId, { pinned: true }).then(minifyStatusList),
  undefined,
  (accountId: string) => !!accountId,
);

export { usePinnedStatuses };
