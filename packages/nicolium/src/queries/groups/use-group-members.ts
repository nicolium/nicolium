import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { makePaginatedResponseQuery } from '@/queries/utils/make-paginated-response-query';
import { removePageItem } from '@/utils/queries';

import { queryClient } from '../client';
import { queryKeys } from '../keys';
import { scopedQueryKey } from '../query';
import { minifyAccountList, minifyList } from '../utils/minify-list';

import type { GroupMember, GroupRole, PaginatedResponse } from 'pl-api';

const removeGroupMember = (groupId: string, accountId: string, scopeUrl: string) =>
  removePageItem(
    scopedQueryKey(queryKeys.accountsLists.groupMembers.root(groupId), scopeUrl),
    accountId,
    (member: MinifiedGroupMember, accountId: string) => member.account_id === accountId,
  );

const minifyGroupMember = ({ account, ...groupMember }: GroupMember) => ({
  ...groupMember,
  account_id: account.id,
});

type MinifiedGroupMember = ReturnType<typeof minifyGroupMember>;

const minifyGroupMembersList = (
  response: PaginatedResponse<GroupMember>,
  scopeUrl: string,
): PaginatedResponse<MinifiedGroupMember> =>
  minifyList(response, minifyGroupMember, (groupMembers) => {
    for (const { account } of groupMembers) {
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.accounts.show(account.id), scopeUrl),
        account,
      );
    }
  });

const useGroupMembers = makePaginatedResponseQuery(
  (groupId: string, role?: GroupRole) => queryKeys.accountsLists.groupMembers.byRole(groupId, role),
  (client, [groupId, role], scopeUrl) =>
    client.experimental.groups
      .getGroupMemberships(groupId, role)
      .then((members) => minifyGroupMembersList(members, scopeUrl)),
);

const useKickGroupMemberMutation = (groupId: string, accountId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['accountsLists', 'groupMembers', groupId, accountId],
    mutationFn: () => client.experimental.groups.kickGroupUsers(groupId, [accountId]),
    onSuccess: () => removeGroupMember(groupId, accountId, scopeUrl),
  });
};

const useGroupMembershipRequestsQuery = makePaginatedResponseQuery(
  (groupId: string) => queryKeys.accountsLists.groupMembershipRequests(groupId),
  (client, [groupId], scopeUrl) =>
    client.experimental.groups
      .getGroupMembershipRequests(groupId)
      .then((accounts) => minifyAccountList(accounts, scopeUrl)),
);

const useAcceptGroupMembershipRequestMutation = (groupId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: queryKeys.accountsLists.groupMembershipRequests(groupId),
    mutationFn: (accountId: string) =>
      client.experimental.groups.acceptGroupMembershipRequest(groupId, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(
          queryKeys.accountsLists.groupMembershipRequests(groupId),
          scopeUrl,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.accountsLists.groupMembers.root(groupId), scopeUrl),
      });
    },
  });
};

const useRejectGroupMembershipRequestMutation = (groupId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: queryKeys.accountsLists.groupMembershipRequests(groupId),
    mutationFn: (accountId: string) =>
      client.experimental.groups.rejectGroupMembershipRequest(groupId, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(
          queryKeys.accountsLists.groupMembershipRequests(groupId),
          scopeUrl,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.accountsLists.groupMembers.root(groupId), scopeUrl),
      });
    },
  });
};

const usePromoteGroupMemberMutation = (groupId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: queryKeys.accountsLists.groupMembers.root(groupId),
    mutationFn: ({ accountId, role }: { accountId: string; role: GroupRole }) =>
      client.experimental.groups.promoteGroupUsers(groupId, [accountId], role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.accountsLists.groupMembers.root(groupId), scopeUrl),
      });
    },
  });
};

const useDemoteGroupMemberMutation = (groupId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: queryKeys.accountsLists.groupMembers.root(groupId),
    mutationFn: ({ accountId, role }: { accountId: string; role: GroupRole }) =>
      client.experimental.groups.demoteGroupUsers(groupId, [accountId], role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.accountsLists.groupMembers.root(groupId), scopeUrl),
      });
    },
  });
};

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
