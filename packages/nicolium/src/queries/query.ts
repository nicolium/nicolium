import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';

import { useCurrentAccountContext } from '@/contexts/current-account-context';
import { backendUrl } from '@/stores/auth';

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
  const accountOrInstanceUrl = useCurrentAccountContext().meUrl || backendUrl;

  const { queryKey } = options;
  const modifiedQueryKey = [accountOrInstanceUrl, ...queryKey] as unknown as TQueryKey;

  const placeholderData = () => {
    const instanceUrl = new URL(accountOrInstanceUrl).origin;
    return queryClient.getQueryData<NonFunctionGuard<TQueryFnData>>([instanceUrl, queryKey]);
  };

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
  const accountOrInstanceUrl = useCurrentAccountContext().meUrl || backendUrl;

  const { queryKey } = options;
  const modifiedQueryKey = [accountOrInstanceUrl, ...queryKey] as unknown as TQueryKey;

  const placeholderData = () => {
    const instanceUrl = new URL(accountOrInstanceUrl).origin;
    return queryClient.getQueryData<NonFunctionGuard<InfiniteData<TQueryFnData, TPageParam>>>([
      instanceUrl,
      queryKey,
    ]);
  };

  return useInfiniteQuery({ ...options, queryKey: modifiedQueryKey, placeholderData });
}

export { useAppInfiniteQuery, useAppQuery };
