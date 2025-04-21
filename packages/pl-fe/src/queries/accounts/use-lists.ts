import { useMutation, useQuery } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';
import { useFeatures } from 'pl-fe/hooks/use-features';

import { queryClient } from '../client';

import type { CreateListParams, List, UpdateListParams } from 'pl-api';

const useLists = <T>(
  select?: ((data: Array<List>) => T),
) => {
  const client = useClient();
  const features = useFeatures();

  return useQuery({
    queryKey: ['lists'],
    queryFn: () => client.lists.getLists(),
    enabled: features.lists,
    select,
  });
};

const useList = (listId?: string) => useLists((data) => listId ? data.find(list => list.id === listId) : undefined);

const useCreateList = () => {
  const client = useClient();

  return useMutation({
    mutationKey: ['lists', 'create'],
    mutationFn: (params: CreateListParams) => client.lists.createList(params),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['lists'] }),
  });
};

const useDeleteList = () => {
  const client = useClient();

  return useMutation({
    mutationKey: ['lists', 'delete'],
    mutationFn: (listId: string) => client.lists.deleteList(listId),
    onSuccess: (_, deletedListId) => {
      queryClient.setQueryData<Array<List>>(
        ['lists'],
        (prevData) => prevData?.filter(({ id }) => id !== deletedListId),
      );
    },
  });
};

const useUpdateList = (listId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['lists', 'update', listId],
    mutationFn: (params: UpdateListParams) => client.lists.updateList(listId, params),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['lists'] }),
  });
};

export { useLists, useList, useCreateList, useDeleteList, useUpdateList };
