import { type InfiniteData, useMutation } from '@tanstack/react-query';

import { importEntities } from '@/actions/importer';
import { useClient } from '@/hooks/use-client';
import { makePaginatedResponseQuery } from '@/queries/utils/make-paginated-response-query';
import { store } from '@/store';

import { queryClient } from '../client';
import { minifyAccountList, minifyList } from '../utils/minify-list';

import type { GroupMember, GroupRole, PaginatedResponse } from 'pl-api';

const removeGroupMember = (groupId: string, accountId: string) =>
  queryClient.setQueriesData<InfiniteData<PaginatedResponse<MinifiedGroupMember>>>(
    { queryKey: ['accountsLists', 'groupMembers', groupId] },
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
      store.dispatch(
        importEntities({ accounts: groupMembers.map(({ account }) => account) }) as any,
      );
    },
  );

const useGroupMembers = makePaginatedResponseQuery(
  (groupId: string, role?: GroupRole) => ['accountsLists', 'groupMembers', groupId, role],
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
  (groupId: string) => ['accountsLists', 'groupMembershipRequests', groupId],
  (client, [groupId]) =>
    client.experimental.groups.getGroupMembershipRequests(groupId).then(minifyAccountList),
);

const useAcceptGroupMembershipRequestMutation = (groupId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['accountsLists', 'groupMembershipRequests', groupId],
    mutationFn: (accountId: string) =>
      client.experimental.groups.acceptGroupMembershipRequest(groupId, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['accountsLists', 'groupMembershipRequests', groupId],
      });
      queryClient.invalidateQueries({ queryKey: ['accountsLists', 'groupMembers', groupId] });
    },
  });
};

const useRejectGroupMembershipRequestMutation = (groupId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['accountsLists', 'groupMembershipRequests', groupId],
    mutationFn: (accountId: string) =>
      client.experimental.groups.rejectGroupMembershipRequest(groupId, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['accountsLists', 'groupMembershipRequests', groupId],
      });
      queryClient.invalidateQueries({ queryKey: ['accountsLists', 'groupMembers', groupId] });
    },
  });
};

const usePromoteGroupMemberMutation = (groupId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['accountsLists', 'groupMembers', groupId],
    mutationFn: ({ accountId, role }: { accountId: string; role: GroupRole }) =>
      client.experimental.groups.promoteGroupUsers(groupId, [accountId], role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountsLists', 'groupMembers', groupId] });
    },
  });
};

const useDemoteGroupMemberMutation = (groupId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['accountsLists', 'groupMembers', groupId],
    mutationFn: ({ accountId, role }: { accountId: string; role: GroupRole }) =>
      client.experimental.groups.demoteGroupUsers(groupId, [accountId], role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountsLists', 'groupMembers', groupId] });
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
