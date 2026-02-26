import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { makePaginatedResponseQuery } from '@/queries/utils/make-paginated-response-query';

import { queryClient } from '../client';
import { queryKeys } from '../keys';
import { minifyAccountList, minifyList } from '../utils/minify-list';

import type { GroupMember, GroupRole, PaginatedResponse } from 'pl-api';

const removeGroupMember = (groupId: string, accountId: string) =>
  queryClient.setQueriesData<InfiniteData<PaginatedResponse<MinifiedGroupMember>>>(
    { queryKey: queryKeys.accountsLists.groupmembers.root(groupId) },
    (data) =>
      data
        ? {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              items: page.items.filter((member) => member.account_id !== accountId),
            })),
          }
        : undefined,
  );

const minifyGroupMembersList = (
  response: PaginatedResponse<GroupMember>,
): PaginatedResponse<Omit<GroupMember, 'account'> & { account_id: string }> =>
  minifyList(
    response,
    ({ account, ...groupMember }) => ({ ...groupMember, account_id: account.id }),
    (groupMembers) => {
      for (const { account } of groupMembers) {
        queryClient.setQueryData(queryKeys.accounts.show(account.id), account);
      }
    },
  );

const useGroupMembers = makePaginatedResponseQuery(
  (groupId: string, role?: GroupRole) => queryKeys.accountsLists.groupMembers.byRole(groupId, role),
  (client, [groupId, role]) =>
    client.experimental.groups.getGroupMemberships(groupId, role).then(minifyGroupMembersList),
);

const useKickGroupMemberMutation = (groupId: string, accountId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['accountsLists', 'groupMembers', groupId, accountId],
    mutationFn: () => client.experimental.groups.kickGroupUsers(groupId, [accountId]),
    onSuccess: () => removeGroupMember(groupId, accountId),
  });
};

const useGroupMembershipRequestsQuery = makePaginatedResponseQuery(
  (groupId: string) => queryKeys.accountsLists.groupMembershipRequests(groupId),
  (client, [groupId]) =>
    client.experimental.groups.getGroupMembershipRequests(groupId).then(minifyAccountList),
);

const useAcceptGroupMembershipRequestMutation = (groupId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.accountsLists.groupMembershipRequests(groupId),
    mutationFn: (accountId: string) =>
      client.experimental.groups.acceptGroupMembershipRequest(groupId, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.accountsLists.groupMembershipRequests(groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.accountsLists.groupmembers.root(groupId),
      });
    },
  });
};

const useRejectGroupMembershipRequestMutation = (groupId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.accountsLists.groupMembershipRequests(groupId),
    mutationFn: (accountId: string) =>
      client.experimental.groups.rejectGroupMembershipRequest(groupId, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.accountsLists.groupMembershipRequests(groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.accountsLists.groupmembers.root(groupId),
      });
    },
  });
};

const usePromoteGroupMemberMutation = (groupId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.accountsLists.groupmembers.root(groupId),
    mutationFn: ({ accountId, role }: { accountId: string; role: GroupRole }) =>
      client.experimental.groups.promoteGroupUsers(groupId, [accountId], role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.accountsLists.groupmembers.root(groupId),
      });
    },
  });
};

const useDemoteGroupMemberMutation = (groupId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.accountsLists.groupmembers.root(groupId),
    mutationFn: ({ accountId, role }: { accountId: string; role: GroupRole }) =>
      client.experimental.groups.demoteGroupUsers(groupId, [accountId], role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.accountsLists.groupmembers.root(groupId),
      });
    },
  });
};

type MinifiedGroupMember = ReturnType<typeof minifyGroupMembersList>['items'][0];

export {
  useGroupMembers,
  useKickGroupMemberMutation,
  useGroupMembershipRequestsQuery,
  useAcceptGroupMembershipRequestMutation,
  useRejectGroupMembershipRequestMutation,
  usePromoteGroupMemberMutation,
  useDemoteGroupMemberMutation,
  removeGroupMember,
  type MinifiedGroupMember,
};
