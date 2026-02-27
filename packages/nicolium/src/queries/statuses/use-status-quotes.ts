import { makePaginatedResponseQuery } from '@/queries/utils/make-paginated-response-query';
import { minifyStatusList } from '@/queries/utils/minify-list';

import { queryKeys } from '../keys';

const useStatusQuotes = makePaginatedResponseQuery(
  (statusId: string) => queryKeys.statusLists.quotes(statusId),
  (client, params) => client.statuses.getStatusQuotes(...params).then(minifyStatusList),
);

export { useStatusQuotes };
