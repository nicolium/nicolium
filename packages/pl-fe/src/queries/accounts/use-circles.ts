import { type InfiniteData, useMutation, useQuery } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';

import { queryClient } from '../client';
import { filterById } from '../utils/filter-id';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';
import { minifyAccountList } from '../utils/minify-list';

import type { Circle, PaginatedResponse } from 'pl-api';

const useCircles = <T>(
  select?: ((data: Array<Circle>) => T),
) => {
  const client = useClient();
  const features = useFeatures();

  return useQuery({
    queryKey: ['circles'],
    queryFn: () => client.circles.fetchCircles(),
    enabled: features.circles,
    select,
  });
};

const useCircle = (circleId?: string) => useCircles((data) => circleId ? data.find(circle => circle.id === circleId) : undefined);

const useCreateCircle = () => {
  const client = useClient();

  return useMutation({
    mutationKey: ['circles', 'create'],
    mutationFn: (title: string) => client.circles.createCircle(title),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['circles'] }),
  });
};

const useDeleteCircle = () => {
  const client = useClient();

  return useMutation({
    mutationKey: ['circles', 'delete'],
    mutationFn: (circleId: string) => client.circles.deleteCircle(circleId),
    onSuccess: (_, deletedCircleId) => {
      queryClient.setQueryData<Array<Circle>>(
        ['circles'],
        (prevData) => prevData?.filter(({ id }) => id !== deletedCircleId),
      );
    },
  });
};

const useUpdateCircle = (circleId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['circles', 'update', circleId],
    mutationFn: (title: string) => client.circles.updateCircle(circleId, title),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['circles'] }),
  });
};

const useCircleAccounts = makePaginatedResponseQuery(
  (circleId: string) => ['accountsLists', 'circles', circleId],
  (client, [circleId]) => client.circles.getCircleAccounts(circleId).then(minifyAccountList),
);

const useAddAccountsToCircle = (circleId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['accountsLists', 'circles', circleId, 'add'],
    mutationFn: (accountIds: Array<string>) => client.circles.addCircleAccounts(circleId, accountIds),
    onSettled: (_, __, accountIds) => {
      queryClient.invalidateQueries({ queryKey: ['accountsLists', 'circles', circleId] });
    },
  });
};

const useRemoveAccountsFromCircle = (circleId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['accountsLists', 'circles', circleId, 'remove'],
    mutationFn: (accountIds: Array<string>) => client.circles.deleteCircleAccounts(circleId, accountIds),
    onSettled: (_, __, accountIds) => {
      queryClient.setQueryData<InfiniteData<PaginatedResponse<string>>>(['accountsLists', 'circles', circleId], filterById(accountIds));
    },
  });
};

export { useCircles, useCircle, useCreateCircle, useDeleteCircle, useUpdateCircle, useCircleAccounts, useAddAccountsToCircle, useRemoveAccountsFromCircle };
