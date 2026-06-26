import { useMutation, type UseQueryResult } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryKeys } from '@/queries/keys';
import { scopedQueryKey, useAppQuery } from '@/queries/query';

import { queryClient } from '../client';
import { filterById } from '../utils/filter-id';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';
import { minifyAccountList } from '../utils/minify-list';

import type { CreateListParams, List, UpdateListParams } from 'pl-api';

function useLists<T>(select: (data: Array<List>) => T, enabled?: boolean): UseQueryResult<T, Error>;
function useLists(enabled?: boolean): UseQueryResult<Array<List>, Error>;
function useLists<T = Array<List>>(select?: ((data: Array<List>) => T) | boolean, enabled = true) {
  const client = useClient();
  const features = useFeatures();
  const { isLoggedIn } = useLoggedIn();
  const selectFn = typeof select === 'function' ? select : undefined;
  const isEnabled = typeof select === 'boolean' ? select : enabled;

  return useAppQuery({
    queryKey: queryKeys.lists.all,
    queryFn: () => client.lists.getLists(),
    enabled: isLoggedIn && features.lists && isEnabled,
    select: selectFn,
  });
}

const useList = (listId?: string) =>
  useLists(
    (data) => (listId ? data.find((list) => list.id === listId) : undefined),
    listId !== undefined,
  );

const useCreateList = () => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['lists', 'create'],
    mutationFn: (params: CreateListParams) => client.lists.createList(params),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: scopedQueryKey(queryKeys.lists.all, scopeUrl) }),
  });
};

const useDeleteList = () => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['lists', 'delete'],
    mutationFn: (listId: string) => client.lists.deleteList(listId),
    onSuccess: (_, deletedListId) => {
      queryClient.setQueryData(scopedQueryKey(queryKeys.lists.all, scopeUrl), (prevData) =>
        prevData?.filter(({ id }) => id !== deletedListId),
      );
    },
  });
};

const useUpdateList = (listId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['lists', 'update', listId],
    mutationFn: (params: UpdateListParams) => client.lists.updateList(listId, params),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: scopedQueryKey(queryKeys.lists.all, scopeUrl) }),
  });
};

const useListAccounts = makePaginatedResponseQuery(
  (listId: string) => queryKeys.accountsLists.listMembers(listId),
  (client, [listId], scopeUrl) =>
    client.lists.getListAccounts(listId).then((accounts) => minifyAccountList(accounts, scopeUrl)),
);

const useAddAccountsToList = (listId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['accountsLists', 'lists', listId, 'add'],
    mutationFn: (accountIds: Array<string>) => client.lists.addListAccounts(listId, accountIds),
    onSettled: (_, __, accountIds) => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.accountsLists.listMembers(listId), scopeUrl),
      });
      accountIds.forEach((accountId) =>
        queryClient.setQueryData(
          scopedQueryKey(queryKeys.lists.forAccount(accountId), scopeUrl),
          (listIds) => (listIds ? [...listIds, listId] : undefined),
        ),
      );
    },
  });
};

const useRemoveAccountsFromList = (listId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['accountsLists', 'lists', listId, 'remove'],
    mutationFn: (accountIds: Array<string>) => client.lists.deleteListAccounts(listId, accountIds),
    onSettled: (_, __, accountIds) => {
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.accountsLists.listMembers(listId), scopeUrl),
        filterById(accountIds),
      );
      accountIds.forEach((accountId) =>
        queryClient.setQueryData(
          scopedQueryKey(queryKeys.lists.forAccount(accountId), scopeUrl),
          (listIds) => listIds?.filter((id) => id !== listId),
        ),
      );
    },
  });
};

const useListsForAccount = (accountId: string) => {
  const client = useClient();

  return useAppQuery({
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
