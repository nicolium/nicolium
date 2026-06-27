import { makePaginatedResponseQuery } from '@/queries/utils/make-paginated-response-query';
import { minifyAccountList } from '@/queries/utils/minify-list';

import { queryKeys } from '../keys';

const useEventParticipations = makePaginatedResponseQuery(
  (statusId: string) => queryKeys.accountsLists.eventParticipations(statusId),
  (client, params, scopeUrl) =>
    client.events
      .getEventParticipations(...params)
      .then((accounts) => minifyAccountList(accounts, scopeUrl)),
);

export { useEventParticipations };
