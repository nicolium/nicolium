import { useInfiniteQuery, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useCurrentAccount } from '@/contexts/current-account-context';

import type { DataOf } from '@/queries/keys';
import type {
  DataTag,
  DefaultError,
  InfiniteData,
  QueriesOptions,
  QueriesResults,
  QueryKey,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

function useAppQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>): UseQueryResult<TData, TError> {
  const scopeUrl = useCurrentAccount();

  const { queryKey } = options;
  const scopedQueryKey = useMemo(
    () => [scopeUrl, ...queryKey] as unknown as TQueryKey,
    [scopeUrl, queryKey],
  );

  return useQuery({ ...options, queryKey: scopedQueryKey });
}

function useAppInfiniteQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>,
): UseInfiniteQueryResult<TData, TError> {
  const scopeUrl = useCurrentAccount();

  const { queryKey } = options;
  const scopedQueryKey = useMemo(
    () => [scopeUrl, ...queryKey] as unknown as TQueryKey,
    [scopeUrl, queryKey],
  );

  return useInfiniteQuery({ ...options, queryKey: scopedQueryKey });
}

function useAppQueries<T extends Array<unknown>, TCombinedResult = QueriesResults<T>>(options: {
  queries: readonly [...QueriesOptions<T>];
  combine?: (result: QueriesResults<T>) => TCombinedResult;
  subscribed?: boolean;
}): TCombinedResult {
  const queryClient = useQueryClient();
  const scopeUrl = useCurrentAccount();

  const { queries } = options;
  const scopedQueries = useMemo(
    () =>
      queries.map((query) => {
        const { queryKey } = query as { queryKey: QueryKey };

        return {
          ...(query as object),
          queryKey: [scopeUrl, ...queryKey],
        };
      }) as unknown as readonly [...QueriesOptions<T>],
    [scopeUrl, queryClient, queries],
  );

  return useQueries({ ...options, queries: scopedQueries });
}

function scopedQueryKey<T extends QueryKey>(
  queryKey: T,
  scopeUrl: string,
): DataTag<QueryKey, DataOf<T>> {
  return [scopeUrl, ...queryKey] as unknown as DataTag<QueryKey, DataOf<T>>;
}

export { useAppInfiniteQuery, useAppQueries, useAppQuery, scopedQueryKey };
