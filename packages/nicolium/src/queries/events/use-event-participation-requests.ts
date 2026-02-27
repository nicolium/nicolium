import { useMutation } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { makePaginatedResponseQuery } from '@/queries/utils/make-paginated-response-query';
import { minifyList } from '@/queries/utils/minify-list';
import { updatePaginatedResponse } from '@/queries/utils/update-paginated-response';

import { queryClient } from '../client';
import { queryKeys } from '../keys';

import type { PlApiClient } from 'pl-api';

const minifyRequestList = (
  response: Awaited<
    ReturnType<InstanceType<typeof PlApiClient>['events']['getEventParticipationRequests']>
  >,
) =>
  minifyList(
    response,
    ({ account, participation_message }) => ({ account_id: account.id, participation_message }),
    (requests) => {
      for (const { account } of requests) {
        queryClient.setQueryData(queryKeys.accounts.show(account.id), account);
      }
    },
  );

const removeRequest = (statusId: string, accountId: string) =>
  updatePaginatedResponse(queryKeys.accountsLists.eventParticipationRequests(statusId), (items) =>
    items.filter(({ account_id }) => account_id !== accountId),
  );

const useEventParticipationRequests = makePaginatedResponseQuery(
  (statusId: string) => queryKeys.accountsLists.eventParticipationRequests(statusId),
  (client, params) =>
    client.events.getEventParticipationRequests(...params).then(minifyRequestList),
);

const useAcceptEventParticipationRequestMutation = (statusId: string, accountId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['accountsLists', 'eventParticipationRequests', statusId, accountId],
    mutationFn: () => client.events.acceptEventParticipationRequest(statusId, accountId),
    onSettled: () => removeRequest(statusId, accountId),
  });
};

const useRejectEventParticipationRequestMutation = (statusId: string, accountId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['accountsLists', 'eventParticipationRequests', statusId, accountId],
    mutationFn: () => client.events.rejectEventParticipationRequest(statusId, accountId),
    onSettled: () => removeRequest(statusId, accountId),
  });
};
export {
  useEventParticipationRequests,
  useAcceptEventParticipationRequestMutation,
  useRejectEventParticipationRequestMutation,
};
