import { makePaginatedResponseQuery } from '@/queries/utils/make-paginated-response-query';
import { minifyAccountList } from '@/queries/utils/minify-list';

import { queryKeys } from '../keys';

const useEventParticipations = makePaginatedResponseQuery(
  (statusId: string) => queryKeys.accountsLists.eventParticipations(statusId),
  (client, params) => client.events.getEventParticipations(...params).then(minifyAccountList),
);

export { useEventParticipations };
