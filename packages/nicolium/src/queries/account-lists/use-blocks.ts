import { queryKeys } from '../keys';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';
import { minifyBlockedAccountList, minifyMutedAccountList } from '../utils/minify-list';

const useBlocks = makePaginatedResponseQuery(queryKeys.accountsLists.blocked, (client) =>
  client.filtering.getBlocks({ with_relationships: true }).then(minifyBlockedAccountList),
);

const useMutes = makePaginatedResponseQuery(queryKeys.accountsLists.muted, (client) =>
  client.filtering.getMutes({ with_relationships: true }).then(minifyMutedAccountList),
);

export { useBlocks, useMutes };
