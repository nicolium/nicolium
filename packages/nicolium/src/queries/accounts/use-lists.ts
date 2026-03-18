import { useMutation, useQuery, type UseQueryResult } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { queryKeys } from '@/queries/keys';

import { queryClient } from '../client';
import { filterById } from '../utils/filter-id';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';
import { minifyAccountList } from '../utils/minify-list';

import type { CreateListParams, List, UpdateListParams } from 'pl-api';

function useLists<T>(select: (data: Array<List>) => T): UseQueryResult<T, Error>;
function useLists(): UseQueryResult<Array<List>, Error>;
function useLists<T = Array<List>>(select?: (data: Array<List>) => T) {
  const client = useClient();
  const features = useFeatures();

  return useQuery({
    queryKey: queryKeys.lists.all,
    queryFn: () => client.lists.getLists(),
    enabled: features.lists,
    select,
  });
}

const useList = (listId?: string) =>
  useLists((data) => (listId ? data.find((list) => list.id === listId) : undefined));

const useCreateList = () => {
  const client = useClient();

  return useMutation({
    mutationKey: ['lists', 'create'],
    mutationFn: (params: CreateListParams) => client.lists.createList(params),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.lists.all }),
  });
};

const useDeleteList = () => {
  const client = useClient();

  return useMutation({
    mutationKey: ['lists', 'delete'],
    mutationFn: (listId: string) => client.lists.deleteList(listId),
    onSuccess: (_, deletedListId) => {
      queryClient.setQueryData(queryKeys.lists.all, (prevData) =>
        prevData?.filter(({ id }) => id !== deletedListId),
      );
    },
  });
};

const useUpdateList = (listId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['lists', 'update', listId],
    mutationFn: (params: UpdateListParams) => client.lists.updateList(listId, params),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.lists.all }),
  });
};

const useListAccounts = makePaginatedResponseQuery(
  (listId: string) => queryKeys.accountsLists.listMembers(listId),
  (client, [listId]) => client.lists.getListAccounts(listId).then(minifyAccountList),
);

const useAddAccountsToList = (listId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['accountsLists', 'lists', listId, 'add'],
    mutationFn: (accountIds: Array<string>) => client.lists.addListAccounts(listId, accountIds),
    onSettled: (_, __, accountIds) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accountsLists.listMembers(listId) });
      accountIds.forEach((accountId) =>
        queryClient.setQueryData(queryKeys.lists.forAccount(accountId), (listIds) =>
          listIds ? [...listIds, listId] : undefined,
        ),
      );
    },
  });
};

const useRemoveAccountsFromList = (listId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['accountsLists', 'lists', listId, 'remove'],
    mutationFn: (accountIds: Array<string>) => client.lists.deleteListAccounts(listId, accountIds),
    onSettled: (_, __, accountIds) => {
      queryClient.setQueryData(queryKeys.accountsLists.listMembers(listId), filterById(accountIds));
      accountIds.forEach((accountId) =>
        queryClient.setQueryData(queryKeys.lists.forAccount(accountId), (listIds) =>
          listIds?.filter((id) => id !== listId),
        ),
      );
    },
  });
};

const useListsForAccount = (accountId: string) => {
  const client = useClient();

  return useQuery({
    queryKey: queryKeys.lists.forAccount(accountId),
    queryFn: () =>
      client.accounts.getAccountLists(accountId).then((lists) => lists.map((list) => list.id)),
  });
};

export {
  useLists,
  useList,
  useCreateList,
  useDeleteList,
  useUpdateList,
  useListAccounts,
  useAddAccountsToList,
  useRemoveAccountsFromList,
  useListsForAccount,
};
