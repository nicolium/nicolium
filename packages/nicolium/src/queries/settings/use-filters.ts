import { useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';

import { changeSetting } from '@/actions/settings';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { scopedQueryKey, useAppQuery } from '@/queries/query';
import { useSettings } from '@/stores/settings';

import { queryKeys } from '../keys';

import type { CreateFilterParams, Filter, UpdateFilterParams } from 'pl-api';

type FilterContextType = Filter['context'][0];

function useFilters<T>(select: (data: Array<Filter>) => T): UseQueryResult<T, Error>;
function useFilters(): UseQueryResult<Array<Filter>, Error>;
function useFilters<T = Array<Filter>>(select?: (data: Array<Filter>) => T) {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();
  const features = useFeatures();
  const { filters: settingsFilters } = useSettings();

  const query = useAppQuery({
    queryKey: queryKeys.filters.all,
    queryFn: () => client.filtering.getFilters(),
    enabled: isLoggedIn && (features.filters || features.filtersV2),
    staleTime: 30 * 60 * 1000, // 30 minutes
    select,
  });

  if (!features.filters && !features.filtersV2) {
    query.data = (select ? select(settingsFilters) : settingsFilters) as T;
  }

  return query;
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
  const scopeUrl = useScopeUrl();
  const features = useFeatures();
  const { filters: settingsFilters } = useSettings();

  const query = useAppQuery({
    queryKey: queryKeys.filters.show(filterId!),
    queryFn: () => {
      if (!features.filters && !features.filtersV2) {
        return settingsFilters.find((filter) => filter.id === filterId);
      }
      if (!filterId) return undefined;
      return client.filtering.getFilter(filterId);
    },
    enabled: !!filterId,
    placeholderData: () =>
      queryClient
        .getQueryData(scopedQueryKey(queryKeys.filters.all, scopeUrl))
        ?.find((filter) => filter.id === filterId),
  });

  return query;
};

const useCreateFilter = () => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();
  const features = useFeatures();

  return useMutation({
    mutationKey: ['filters', 'create'],
    mutationFn: async (data: CreateFilterParams) => {
      if (!features.filters && !features.filtersV2) {
        let result: Filter | undefined;

        changeSetting(['filters'], (filters: Array<Filter>) => {
          if (!filters) filters = [];

          const newFilter: Filter = {
            id: (+(filters.at(-1)?.id ?? '0') + 1).toString(),
            expires_at:
              !data.expires_in || data.expires_in === 0
                ? null
                : new Date(Date.now() + data.expires_in * 1000).toISOString(),
            keywords: data.keywords_attributes.map((keyword, index) => ({
              id: (index + 1).toString(),
              keyword: keyword.keyword,
              whole_word: keyword.whole_word ?? false,
            })),
            statuses: [],
            ...data,
            filter_action: data.filter_action ?? 'warn',
          };

          result = newFilter;

          return [...filters, newFilter];
        });

        return result!;
      } else return await client.filtering.createFilter(data);
    },
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: scopedQueryKey(queryKeys.filters.all, scopeUrl) });
      if (data)
        queryClient.setQueryData(scopedQueryKey(queryKeys.filters.show(data.id), scopeUrl), data);
    },
  });
};

const useUpdateFilter = (filterId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();
  const features = useFeatures();

  return useMutation({
    mutationKey: ['filters', filterId, 'update'],
    mutationFn: async (data: UpdateFilterParams) => {
      if (!features.filters && !features.filtersV2) {
        let result: Filter | undefined;

        changeSetting(['filters'], (filters: Array<Filter>) => {
          const filter = filters?.find((filter) => filter.id === filterId);

          if (!filter) return filters;

          if (data.title !== undefined) filter.title = data.title;
          if (data.context !== undefined) filter.context = data.context;
          if (data.filter_action !== undefined) filter.filter_action = data.filter_action;
          if (data.expires_in !== undefined) {
            filter.expires_at =
              data.expires_in === 0
                ? null
                : new Date(Date.now() + data.expires_in * 1000).toISOString();
          }
          if (data.keywords_attributes !== undefined) {
            for (const keyword of data.keywords_attributes) {
              if (keyword._destroy && keyword.id) {
                filter.keywords = filter.keywords.filter((k) => k.id !== keyword.id);
              } else if (keyword.id) {
                const existingKeyword = filter.keywords.find((k) => k.id === keyword.id);
                if (existingKeyword) {
                  if (keyword.keyword !== undefined) existingKeyword.keyword = keyword.keyword;
                  if (keyword.whole_word !== undefined)
                    existingKeyword.whole_word = keyword.whole_word;
                }
              } else {
                filter.keywords.push({
                  id: (+(filter.keywords.at(-1)?.id ?? '0') + 1).toString(),
                  keyword: keyword.keyword,
                  whole_word: keyword.whole_word ?? false,
                });
              }
            }
          }

          result = JSON.parse(JSON.stringify(filter)) as Filter;

          return filters;
        });

        return result!;
      } else return await client.filtering.updateFilter(filterId, data);
    },
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: scopedQueryKey(queryKeys.filters.all, scopeUrl) });
      if (data)
        queryClient.setQueryData(scopedQueryKey(queryKeys.filters.show(filterId), scopeUrl), data);
    },
  });
};

const useDeleteFilter = () => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();
  const features = useFeatures();

  return useMutation({
    mutationKey: ['filters', 'delete'],
    mutationFn: async (filterId: string) => {
      if (!features.filters && !features.filtersV2) {
        changeSetting(['filters'], (filters: Array<Filter>) => {
          return (filters || []).filter((filter) => filter.id !== filterId);
        });

        return {};
      } else return await client.filtering.deleteFilter(filterId);
    },
    onSettled: (_, __, filterId) => {
      queryClient.invalidateQueries({ queryKey: scopedQueryKey(queryKeys.filters.all, scopeUrl) });
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.filters.show(filterId), scopeUrl),
      });
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
