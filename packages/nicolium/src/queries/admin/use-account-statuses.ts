import { makePaginatedResponseQuery } from '@/queries/utils/make-paginated-response-query';
import { minifyStatusList } from '@/queries/utils/minify-list';

import { queryKeys } from '../keys';

import type { AdminGetStatusesParams } from 'pl-api';

const useAdminAccountStatuses = makePaginatedResponseQuery(
  (accountId: string, params?: AdminGetStatusesParams) =>
    queryKeys.admin.accounts.statuses(accountId!, params),
  (client, [accountId, params], scopeUrl) =>
    client.admin.accounts
      .getAccountStatuses(accountId!, params)
      .then((response) => minifyStatusList(response, scopeUrl)),
);

export { useAdminAccountStatuses };
