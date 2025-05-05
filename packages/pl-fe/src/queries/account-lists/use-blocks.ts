import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';
import { minifyAccountList } from '../utils/minify-list';

const useBlocks = makePaginatedResponseQuery(
  () => ['accountsLists', 'blocked'],
  (client) => client.filtering.getBlocks({ with_relationships: true }).then(minifyAccountList),
);

const useMutes = makePaginatedResponseQuery(
  () => ['accountsLists', 'muted'],
  (client) => client.filtering.getMutes({ with_relationships: true }).then(minifyAccountList),
);

export { useBlocks, useMutes };
