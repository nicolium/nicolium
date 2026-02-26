import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { type FiltersAction, FILTERS_FETCH_SUCCESS } from '@/actions/filters';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';

import { queryKeys } from '../keys';

import type { CreateFilterParams, UpdateFilterParams } from 'pl-api';

const useFilters = () => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const features = useFeatures();

  return useQuery({
    queryKey: queryKeys.filters.all,
    queryFn: async () => {
      const response = await client.filtering.getFilters();

      dispatch<FiltersAction>({
        type: FILTERS_FETCH_SUCCESS,
        filters: response,
      });

      return response;
    },
    enabled: features.filters || features.filtersV2,
    staleTime: 30 * 60 * 1000,
  });
};

const useFilter = (filterId?: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useQuery({
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

export { useFilters, useFilter, useCreateFilter, useUpdateFilter, useDeleteFilter };
