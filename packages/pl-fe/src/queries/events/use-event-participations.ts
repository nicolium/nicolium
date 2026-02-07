import { makePaginatedResponseQuery } from '@/queries/utils/make-paginated-response-query';
import { minifyAccountList } from '@/queries/utils/minify-list';

const useEventParticipations = makePaginatedResponseQuery(
  (statusId: string) => ['accountsLists', 'eventParticipations', statusId],
  (client, params) => client.events.getEventParticipations(...params).then(minifyAccountList),
);

export { useEventParticipations };
