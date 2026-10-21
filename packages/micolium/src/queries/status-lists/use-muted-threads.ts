import { makePaginatedResponseQuery } from '@/queries/utils/make-paginated-response-query';
import { minifyStatusList } from '@/queries/utils/minify-list';

import { queryKeys } from '../keys';

const useMutedThreads = makePaginatedResponseQuery(
  () => queryKeys.statusLists.mutedThreads,
  (client, _params, scopeUrl) =>
    client.myAccount.getMutedThreads().then((response) => minifyStatusList(response, scopeUrl)),
);

export { useMutedThreads };
