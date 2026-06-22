import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { useScopeUrl } from '@/hooks/use-scope-url';

import type {
  DefaultError,
  InfiniteData,
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

function scopedQueryKey<T extends QueryKey>(queryKey: T, scopeUrl: string): T {
  return [scopeUrl, ...queryKey] as unknown as T;
}

export { useAppInfiniteQuery, useAppQuery, scopedQueryKey };
