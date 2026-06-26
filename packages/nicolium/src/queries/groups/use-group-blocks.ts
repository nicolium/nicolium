import { useMutation } from '@tanstack/react-query';
import { PaginatedResponse } from 'pl-api';

import { useClient } from '@/hooks/use-client';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryClient } from '@/queries/client';
import { makePaginatedResponseQuery } from '@/queries/utils/make-paginated-response-query';
import { minifyAccountList } from '@/queries/utils/minify-list';

import { queryKeys } from '../keys';
import { scopedQueryKey } from '../query';
import { filterById } from '../utils/filter-id';

import { removeGroupMember } from './use-group-members';

const appendGroupBlock = (groupId: string, accountId: string, scopeUrl: string) =>
  queryClient.setQueryData(
    scopedQueryKey(queryKeys.accountsLists.groupBlocks(groupId), scopeUrl),
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

const removeGroupBlock = (groupId: string, accountId: string, scopeUrl: string) =>
  queryClient.setQueryData(
    scopedQueryKey(queryKeys.accountsLists.groupBlocks(groupId), scopeUrl),
    filterById(accountId),
  );

const useGroupBlocks = makePaginatedResponseQuery(
  (groupId: string) => queryKeys.accountsLists.groupBlocks(groupId),
  (client, [groupId], scopeUrl) =>
    client.experimental.groups
      .getGroupBlocks(groupId)
      .then((accounts) => minifyAccountList(accounts, scopeUrl)),
);

const useBlockGroupUserMutation = (groupId: string, accountId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['accountsLists', 'groupBlocks', groupId, accountId],
    mutationFn: () => client.experimental.groups.blockGroupUsers(groupId, [accountId]),
    onSettled: () => {
      removeGroupMember(groupId, accountId, scopeUrl);
      appendGroupBlock(groupId, accountId, scopeUrl);
    },
  });
};

const useUnblockGroupUserMutation = (groupId: string, accountId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['accountsLists', 'groupBlocks', groupId, accountId],
    mutationFn: () => client.experimental.groups.unblockGroupUsers(groupId, [accountId]),
    onSettled: () => removeGroupBlock(groupId, accountId, scopeUrl),
  });
};

export { useGroupBlocks, useBlockGroupUserMutation, useUnblockGroupUserMutation };
