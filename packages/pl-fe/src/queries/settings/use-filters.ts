import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { type FiltersAction, FILTERS_FETCH_SUCCESS } from '@/actions/filters';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';

import type { CreateFilterParams, Filter, UpdateFilterParams } from 'pl-api';

const useFilters = () => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const features = useFeatures();

  return useQuery({
    queryKey: ['filters'],
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
    queryKey: ['filters', filterId],
    queryFn: () => {
      if (!filterId) return undefined;
      return client.filtering.getFilter(filterId);
    },
    enabled: !!filterId,
    placeholderData: () =>
      queryClient
        .getQueryData<Array<Filter>>(['filters'])
        ?.find((filter) => filter.id === filterId),
  });
};

const useCreateFilter = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['filters', 'create'],
    mutationFn: (data: CreateFilterParams) => client.filtering.createFilter(data),
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: ['filters'] });
      if (data) queryClient.setQueryData<Filter>(['filters', data.id], data);
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
      queryClient.invalidateQueries({ queryKey: ['filters'] });
      if (data) queryClient.setQueryData<Filter>(['filters', filterId], data);
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
      queryClient.invalidateQueries({ queryKey: ['filters'] });
      queryClient.invalidateQueries({ queryKey: ['filters', filterId] });
    },
  });
};

export { useFilters, useFilter, useCreateFilter, useUpdateFilter, useDeleteFilter };
