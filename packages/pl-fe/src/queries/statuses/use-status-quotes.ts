import { makePaginatedResponseQuery } from '@/queries/utils/make-paginated-response-query';
import { minifyStatusList } from '@/queries/utils/minify-list';

const useStatusQuotes = makePaginatedResponseQuery(
  (statusId: string) => ['statusLists', 'quotes', statusId],
  (client, params) => client.statuses.getStatusQuotes(...params).then(minifyStatusList),
);

export { useStatusQuotes };
