import { makePaginatedResponseQuery } from '@/queries/utils/make-paginated-response-query';
import { minifyStatusList } from '@/queries/utils/minify-list';

import { queryKeys } from '../keys';

const usePinnedStatuses = makePaginatedResponseQuery(
  (accountId: string) => queryKeys.statusLists.pins(accountId),
  (client, [accountId], accountOrInstanceUrl) =>
    client.accounts
      .getAccountStatuses(accountId, { pinned: true })
      .then((response) => minifyStatusList(response, accountOrInstanceUrl)),
  undefined,
  (accountId: string) => !!accountId,
);

export { usePinnedStatuses };
