import { useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useAppQuery } from '@/queries/query';

import { queryKeys } from '../keys';

import type { CreateFilterParams, Filter, UpdateFilterParams } from 'pl-api';

type FilterContextType = Filter['context'][0];

function useFilters<T>(select: (data: Array<Filter>) => T): UseQueryResult<T, Error>;
function useFilters(): UseQueryResult<Array<Filter>, Error>;
function useFilters<T = Array<Filter>>(select?: (data: Array<Filter>) => T) {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();
  const features = useFeatures();

  return useAppQuery({
    queryKey: queryKeys.filters.all,
    queryFn: async () => client.filtering.getFilters(),
    enabled: isLoggedIn && (features.filters || features.filtersV2),
    staleTime: 30 * 60 * 1000, // 30 minutes
    select,
  });
}

const timelineToFilterContextType = (columnType?: string): FilterContextType => {
  switch (columnType) {
    case undefined:
      return 'public';
    case 'home':
    case 'notifications':
    case 'public':
    case 'thread':
      return columnType;
    default:
      if (columnType.startsWith('account:')) {
        return 'account';
      }
      if (columnType.startsWith('list:')) {
        return 'home';
      }
      return 'public'; // community, account, hashtag
  }
};

const filterSelector = (contextType?: FilterContextType) => (filters: Array<Filter>) =>
  filters.filter(
    (filter) =>
      (!contextType || filter.context.includes(timelineToFilterContextType(contextType))) &&
      (filter.expires_at === null || Date.parse(filter.expires_at) > Date.now()),
  );

const useFiltersByContext = (contextType: FilterContextType) =>
  useFilters(filterSelector(contextType));

const useFilter = (filterId?: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useAppQuery({
    queryKey: queryKeys.filters.show(filterId!),
    queryFn: () => {
      if (!filterId) return undefined;
      return client.filtering.getFilter(filterId);
    },
    enabled: !!filterId,
    placeholderData: () =>
      queryClient.getQueryData(queryKeys.filters.all)?.find((filter) => filter.id === filterId),
  });
};

const useCreateFilter = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['filters', 'create'],
    mutationFn: (data: CreateFilterParams) => client.filtering.createFilter(data),
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.filters.all });
      if (data) queryClient.setQueryData(queryKeys.filters.show(data.id), data);
    },
  });
};

const useUpdateFilter = (filterId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['filters', filterId, 'update'],
    mutationFn: (data: UpdateFilterParams) => client.filtering.updateFilter(filterId, data),
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.filters.all });
      if (data) queryClient.setQueryData(queryKeys.filters.show(filterId), data);
    },
  });
};

const useDeleteFilter = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['filters', 'delete'],
    mutationFn: (filterId: string) => client.filtering.deleteFilter(filterId),
    onSettled: (_, __, filterId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.filters.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.filters.show(filterId) });
    },
  });
};

export {
  useFilters,
  useFiltersByContext,
  useFilter,
  useCreateFilter,
  useUpdateFilter,
  useDeleteFilter,
  timelineToFilterContextType,
  type FilterContextType,
};
