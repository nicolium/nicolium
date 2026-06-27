import { queryKeys } from '../keys';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';
import { minifyBlockedAccountList, minifyMutedAccountList } from '../utils/minify-list';

const useBlocks = makePaginatedResponseQuery(
  queryKeys.accountsLists.blocked,
  (client, _, scopeUrl) =>
    client.filtering
      .getBlocks({ with_relationships: true })
      .then((accounts) => minifyBlockedAccountList(accounts, scopeUrl)),
);

const useMutes = makePaginatedResponseQuery(queryKeys.accountsLists.muted, (client, _, scopeUrl) =>
  client.filtering
    .getMutes({ with_relationships: true })
    .then((accounts) => minifyMutedAccountList(accounts, scopeUrl)),
);

export { useBlocks, useMutes };
