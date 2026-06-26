import { useMutation } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { makePaginatedResponseQuery } from '@/queries/utils/make-paginated-response-query';
import { minifyList } from '@/queries/utils/minify-list';
import { updatePaginatedResponse } from '@/queries/utils/update-paginated-response';

import { queryClient } from '../client';
import { queryKeys } from '../keys';
import { scopedQueryKey } from '../query';

import type { PlApiClient } from 'pl-api';

const minifyRequestList = (
  response: Awaited<
    ReturnType<InstanceType<typeof PlApiClient>['events']['getEventParticipationRequests']>
  >,
  scopeUrl: string,
) =>
  minifyList(
    response,
    ({ account, participation_message }) => ({ account_id: account.id, participation_message }),
    (requests) => {
      for (const { account } of requests) {
        queryClient.setQueryData(
          scopedQueryKey(queryKeys.accounts.show(account.id), scopeUrl),
          account,
        );
      }
    },
  );

const removeRequest = (statusId: string, accountId: string, scopeUrl: string) =>
  updatePaginatedResponse(
    scopedQueryKey(queryKeys.accountsLists.eventParticipationRequests(statusId), scopeUrl),
    (items) => items.filter(({ account_id }) => account_id !== accountId),
  );

const useEventParticipationRequests = makePaginatedResponseQuery(
  (statusId: string) => queryKeys.accountsLists.eventParticipationRequests(statusId),
  (client, params, scopeUrl) =>
    client.events
      .getEventParticipationRequests(...params)
      .then((requests) => minifyRequestList(requests, scopeUrl)),
);

const useAcceptEventParticipationRequestMutation = (statusId: string, accountId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['accountsLists', 'eventParticipationRequests', statusId, accountId],
    mutationFn: () => client.events.acceptEventParticipationRequest(statusId, accountId),
    onSettled: () => removeRequest(statusId, accountId, scopeUrl),
  });
};

const useRejectEventParticipationRequestMutation = (statusId: string, accountId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['accountsLists', 'eventParticipationRequests', statusId, accountId],
    mutationFn: () => client.events.rejectEventParticipationRequest(statusId, accountId),
    onSettled: () => removeRequest(statusId, accountId, scopeUrl),
  });
};

export {
  useEventParticipationRequests,
  useAcceptEventParticipationRequestMutation,
  useRejectEventParticipationRequestMutation,
};
