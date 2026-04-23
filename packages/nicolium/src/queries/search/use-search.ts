import { notifyManager, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { importEntities } from '@/queries/utils/import-entities';

import { queryKeys } from '../keys';

import type { PaginationParams, SearchParams } from 'pl-api';

const useSearchAccounts = (
  query: string,
  params?: Omit<SearchParams, keyof PaginationParams | 'type' | 'offset'>,
) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useInfiniteQuery({
    queryKey: queryKeys.search.accounts(query, params),
    queryFn: ({ pageParam: offset, signal }) =>
      client.search
        .search(
          query,
          {
            with_relationships: true,
            resolve: true,
            ...params,
            offset,
            type: 'accounts',
          },
          { signal },
        )
        .then(({ accounts }) => {
          notifyManager.batch(() => {
            for (const account of accounts) {
              queryClient.setQueryData(queryKeys.accounts.show(account.id), account);
              if (account.relationship) {
                queryClient.setQueryData(
                  queryKeys.accountRelationships.show(account.id),
                  account.relationship,
                );
              }
            }
          });
          return accounts.map(({ id }) => id);
        }),
    enabled: !!query?.trim(),
    initialPageParam: 0,
    getNextPageParam: (_, allPages) =>
      allPages.at(-1)?.length === 0 ? undefined : allPages.flat().length,
    select: (data) => data.pages.flat(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

const useSearchStatuses = (
  query: string,
  params?: Omit<SearchParams, keyof PaginationParams | 'type' | 'offset'>,
) => {
  const client = useClient();

  return useInfiniteQuery({
    queryKey: queryKeys.search.statuses(query, params),
    queryFn: ({ pageParam: offset, signal }) =>
      client.search
        .search(
          query,
          {
            with_relationships: true,
            resolve: true,
            ...params,
            offset,
            type: 'statuses',
          },
          { signal },
        )
        .then(({ statuses }) => {
          importEntities({ statuses });
          return statuses.map(({ id }) => id);
        }),
    enabled: !!query?.trim(),
    initialPageParam: 0,
    getNextPageParam: (_, allPages) =>
      allPages.at(-1)?.length === 0 ? undefined : allPages.flat().length,
    select: (data) => data.pages.flat(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

const useSearchHashtags = (
  query: string,
  params?: Omit<SearchParams, keyof PaginationParams | 'type' | 'offset'>,
) => {
  const client = useClient();

  return useInfiniteQuery({
    queryKey: queryKeys.search.hashtags(query, params),
    queryFn: ({ pageParam: offset, signal }) =>
      client.search
        .search(
          query,
          {
            ...params,
            offset,
            type: 'hashtags',
          },
          { signal },
        )
        .then(({ hashtags }) => hashtags),
    enabled: !!query?.trim(),
    initialPageParam: 0,
    getNextPageParam: (_, allPages) =>
      allPages.at(-1)?.length === 0 ? undefined : allPages.flat().length,
    select: (data) => data.pages.flat(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

const useSearchGroups = (
  query: string,
  params?: Omit<SearchParams, keyof PaginationParams | 'type' | 'offset'>,
) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useInfiniteQuery({
    queryKey: queryKeys.search.groups(query, params),
    queryFn: ({ pageParam: offset, signal }) =>
      client.search
        .search(
          query,
          {
            resolve: true,
            ...params,
            offset,
            type: 'groups',
          },
          { signal },
        )
        .then(({ groups }) => {
          notifyManager.batch(() => {
            for (const group of groups) {
              queryClient.setQueryData(queryKeys.groups.show(group.id), group);
            }
          });
          return groups.map(({ id }) => id);
        }),
    enabled: !!query?.trim(),
    initialPageParam: 0,
    getNextPageParam: (_, allPages) =>
      allPages.at(-1)?.length === 0 ? undefined : allPages.flat().length,
    select: (data) => data.pages.flat(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export { useSearchAccounts, useSearchStatuses, useSearchHashtags, useSearchGroups };
