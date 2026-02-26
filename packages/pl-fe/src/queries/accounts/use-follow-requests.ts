import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { makePaginatedResponseQuery } from '@/queries/utils/make-paginated-response-query';
import { minifyAccountList } from '@/queries/utils/minify-list';

import { filterById } from '../utils/filter-id';

import type { PaginatedResponse, PlApiClient } from 'pl-api';

const appendFollowRequest = (accountId: string) =>
  queryClient.setQueryData<InfiniteData<PaginatedResponse<string>>>(
    queryKeys.accountsLists.followRequests,
    (data) => {
      if (!data || data.pages.some((page) => page.items.includes(accountId))) return data;

      return {
        ...data,
        pages: data.pages.map((page, index) =>
          index === 0 ? { ...page, items: [accountId, ...page.items] } : page,
        ),
      };
    },
  );

const removeFollowRequest = (accountId: string) =>
  queryClient.setQueryData(queryKeys.accountsLists.followRequests, filterById(accountId));

const makeUseFollowRequests = <T>(select: (data: InfiniteData<PaginatedResponse<string>>) => T) =>
  makePaginatedResponseQuery(
    queryKeys.accountsLists.followRequests,
    (client) => client.myAccount.getFollowRequests().then(minifyAccountList),
    select,
    'isLoggedIn',
  );

const useFollowRequests = makeUseFollowRequests((data) => data.pages.flatMap((page) => page.items));

const useFollowRequestsCount = makeUseFollowRequests(
  (data) => data.pages.flatMap((page) => page.items).length,
);

const useOutgoingFollowRequests = makePaginatedResponseQuery(
  queryKeys.accountsLists.outgoingFollowRequests,
  (client) => client.myAccount.getOutgoingFollowRequests().then(minifyAccountList),
);

const useAcceptFollowRequestMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['accountsLists', 'followRequests', accountId],
    mutationFn: () => client.myAccount.acceptFollowRequest(accountId),
    onSettled: (relationship) => {
      removeFollowRequest(accountId);
      queryClient.setQueryData(queryKeys.accountRelationships.show(accountId), relationship);
    },
  });
};

const useRejectFollowRequestMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['accountsLists', 'followRequests', accountId],
    mutationFn: () => client.myAccount.rejectFollowRequest(accountId),
    onSettled: (relationship) => {
      removeFollowRequest(accountId);
      queryClient.setQueryData(queryKeys.accountRelationships.show(accountId), relationship);
    },
  });
};

const prefetchFollowRequests = (client: PlApiClient) =>
  queryClient.prefetchInfiniteQuery({
    queryKey: queryKeys.accountsLists.followRequests,
    queryFn: ({ pageParam }) =>
      pageParam.next?.() ?? client.myAccount.getFollowRequests().then(minifyAccountList),
    initialPageParam: {
      previous: null,
      next: null,
      items: [],
      partial: false,
    } as PaginatedResponse<string>,
  });

export {
  appendFollowRequest,
  useFollowRequests,
  useFollowRequestsCount,
  useOutgoingFollowRequests,
  useAcceptFollowRequestMutation,
  useRejectFollowRequestMutation,
  prefetchFollowRequests,
};
