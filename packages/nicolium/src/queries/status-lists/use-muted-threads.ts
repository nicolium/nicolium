import { makePaginatedResponseQuery } from '@/queries/utils/make-paginated-response-query';
import { minifyStatusList } from '@/queries/utils/minify-list';

import { queryKeys } from '../keys';

const useMutedThreads = makePaginatedResponseQuery(
  () => queryKeys.statusLists.mutedThreads,
  (client) => client.myAccount.getMutedThreads().then(minifyStatusList),
);

export { useMutedThreads };
