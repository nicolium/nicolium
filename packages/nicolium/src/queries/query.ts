import { useInfiniteQuery, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { useScopeUrl } from '@/hooks/use-scope-url';

import type {
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

type NonFunctionGuard<T> = T extends Function ? never : T;

function useAppQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>): UseQueryResult<TData, TError> {
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  const { queryKey } = options;
  const modifiedQueryKey = useMemo(
    () => [scopeUrl, ...queryKey] as unknown as TQueryKey,
    [scopeUrl, queryKey],
  );

  const placeholderData = useCallback(() => {
    const instanceUrl = new URL(scopeUrl).origin;
    return queryClient.getQueryData<NonFunctionGuard<TQueryFnData>>([instanceUrl, queryKey]);
  }, [scopeUrl, queryClient, queryKey]);

  return useQuery({ ...options, queryKey: modifiedQueryKey, placeholderData });
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
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  const { queryKey } = options;
  const modifiedQueryKey = useMemo(
    () => [scopeUrl, ...queryKey] as unknown as TQueryKey,
    [scopeUrl, queryKey],
  );

  const placeholderData = useCallback(() => {
    const instanceUrl = new URL(scopeUrl).origin;
    return queryClient.getQueryData<NonFunctionGuard<InfiniteData<TQueryFnData, TPageParam>>>([
      instanceUrl,
      queryKey,
    ]);
  }, [scopeUrl, queryClient, queryKey]);

  return useInfiniteQuery({ ...options, queryKey: modifiedQueryKey, placeholderData });
}

function useAppQueries<T extends Array<unknown>, TCombinedResult = QueriesResults<T>>(options: {
  queries: readonly [...QueriesOptions<T>];
  combine?: (result: QueriesResults<T>) => TCombinedResult;
  subscribed?: boolean;
}): TCombinedResult {
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  const { queries } = options;
  const scopedQueries = useMemo(
    () =>
      queries.map((query) => {
        const { queryKey } = query as { queryKey: QueryKey };
        const instanceUrl = new URL(scopeUrl).origin;
        return {
          ...(query as object),
          queryKey: [scopeUrl, ...queryKey],
          placeholderData: () => queryClient.getQueryData([instanceUrl, queryKey]),
        };
      }) as unknown as readonly [...QueriesOptions<T>],
    [scopeUrl, queryClient, queries],
  );

  return useQueries({ ...options, queries: scopedQueries });
}

function scopedQueryKey<T extends QueryKey>(queryKey: T, scopeUrl: string): T {
  return [scopeUrl, ...queryKey] as unknown as T;
}

export { useAppInfiniteQuery, useAppQueries, useAppQuery, scopedQueryKey };
