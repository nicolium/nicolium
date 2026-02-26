import { useMutation, type InfiniteData } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { queryClient } from '@/queries/client';
import { makePaginatedResponseQuery } from '@/queries/utils/make-paginated-response-query';
import { minifyAccountList } from '@/queries/utils/minify-list';

import { queryKeys } from '../keys';
import { filterById } from '../utils/filter-id';

import { removeGroupMember } from './use-group-members';

const appendGroupBlock = (groupId: string, accountId: string) =>
  queryClient.setQueryData<InfiniteData<ReturnType<typeof minifyAccountList>>>(
    queryKeys.accountsLists.groupBlocks(groupId),
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

const removeGroupBlock = (groupId: string, accountId: string) =>
  queryClient.setQueryData<InfiniteData<ReturnType<typeof minifyAccountList>>>(
    queryKeys.accountsLists.groupBlocks(groupId),
    filterById(accountId),
  );

const useGroupBlocks = makePaginatedResponseQuery(
  (groupId: string) => queryKeys.accountsLists.groupBlocks(groupId),
  (client, [groupId]) => client.experimental.groups.getGroupBlocks(groupId).then(minifyAccountList),
);

const useBlockGroupUserMutation = (groupId: string, accountId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['accountsLists', 'groupBlocks', groupId, accountId],
    mutationFn: () => client.experimental.groups.blockGroupUsers(groupId, [accountId]),
    onSettled: () => {
      removeGroupMember(groupId, accountId);
      appendGroupBlock(groupId, accountId);
    },
  });
};

const useUnblockGroupUserMutation = (groupId: string, accountId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['accountsLists', 'groupBlocks', groupId, accountId],
    mutationFn: () => client.experimental.groups.unblockGroupUsers(groupId, [accountId]),
    onSettled: () => removeGroupBlock(groupId, accountId),
  });
};

export { useGroupBlocks, useBlockGroupUserMutation, useUnblockGroupUserMutation };
