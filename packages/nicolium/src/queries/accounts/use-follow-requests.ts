import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { PaginatedResponse, type PlApiClient } from 'pl-api';

import { useClient } from '@/hooks/use-client';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { makePaginatedResponseQuery } from '@/queries/utils/make-paginated-response-query';
import { minifyAccountList } from '@/queries/utils/minify-list';

import { scopedQueryKey } from '../query';
import { filterById } from '../utils/filter-id';

import { useCredentialAccount } from './use-account-credentials';

const appendFollowRequest = (accountId: string, scopeUrl: string) =>
  queryClient.setQueryData(
    scopedQueryKey(queryKeys.accountsLists.followRequests, scopeUrl),
    (data) => {
      if (!data || data.pages.some((page) => page.items.includes(accountId))) return data;

      return {
        ...data,
        pages: data.pages.map((page, index) =>
          index === 0 ? new PaginatedResponse([accountId, ...page.items], page) : page,
        ),
      };
    },
  );

const removeFollowRequest = (accountId: string, scopeUrl: string) =>
  queryClient.setQueryData(
    scopedQueryKey(queryKeys.accountsLists.followRequests, scopeUrl),
    filterById(accountId),
  );

const makeUseFollowRequests = <T>(
  select: (data: InfiniteData<PaginatedResponse<string>>) => T,
  enabled?: (...params: Array<any>) => boolean,
) =>
  makePaginatedResponseQuery(
    queryKeys.accountsLists.followRequests,
    (client, _, scopeUrl) =>
      client.myAccount
        .getFollowRequests()
        .then((accounts) => minifyAccountList(accounts, scopeUrl)),
    select,
    enabled ?? 'isLoggedIn',
  );

const useFollowRequests = makeUseFollowRequests((data) => data.pages.flatMap((page) => page.items));

const selectFollowRequestsCount = (data: InfiniteData<PaginatedResponse<string>>) =>
  data.pages.flatMap((page) => page.items).length;

const useFollowRequestsCountQuery = makeUseFollowRequests(
  selectFollowRequestsCount,
  (enabled: boolean) => enabled,
);

const useFollowRequestsCount = () => {
  const { data: account } = useCredentialAccount();

  const sourceCount = account?.source?.follow_requests_count;

  const query = useFollowRequestsCountQuery(!!account && sourceCount === undefined);

  return sourceCount ?? query.data ?? 0;
};

const useOutgoingFollowRequests = makePaginatedResponseQuery(
  queryKeys.accountsLists.outgoingFollowRequests,
  (client, _, scopeUrl) =>
    client.myAccount
      .getOutgoingFollowRequests()
      .then((accounts) => minifyAccountList(accounts, scopeUrl)),
);

const useAcceptFollowRequestMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['accountsLists', 'followRequests', accountId],
    mutationFn: () => client.myAccount.acceptFollowRequest(accountId),
    onSettled: (relationship) => {
      removeFollowRequest(accountId, scopeUrl);
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.accountRelationships.show(accountId), scopeUrl),
        relationship,
      );
    },
  });
};

const useRejectFollowRequestMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['accountsLists', 'followRequests', accountId],
    mutationFn: () => client.myAccount.rejectFollowRequest(accountId),
    onSettled: (relationship) => {
      removeFollowRequest(accountId, scopeUrl);
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.accountRelationships.show(accountId), scopeUrl),
        relationship,
      );
    },
  });
};

const prefetchFollowRequests = (client: PlApiClient, scopeUrl: string) =>
  queryClient.prefetchInfiniteQuery({
    queryKey: scopedQueryKey(queryKeys.accountsLists.followRequests, scopeUrl),
    queryFn: ({ pageParam }) =>
      pageParam.next?.() ??
      client.myAccount
        .getFollowRequests()
        .then((accounts) => minifyAccountList(accounts, scopeUrl)),
    initialPageParam: { next: null as (() => Promise<PaginatedResponse<string>>) | null },
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
