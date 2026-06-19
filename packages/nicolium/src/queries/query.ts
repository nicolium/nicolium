import { useQuery, useQueryClient } from '@tanstack/react-query';

import { backendUrl, useAuthStore } from '@/stores/auth';

import type {
  DefaultError,
  QueryKey,
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
  const accountOrInstanceUrl = useAuthStore((state) => state.me) || backendUrl;

  const { queryKey } = options;
  const modifiedQueryKey = [accountOrInstanceUrl, ...queryKey] as unknown as TQueryKey;

  const placeholderData = () => {
    const instanceUrl = new URL(accountOrInstanceUrl).origin;
    return queryClient.getQueryData<NonFunctionGuard<TQueryFnData>>([instanceUrl, queryKey]);
  };

  return useQuery({ ...options, queryKey: modifiedQueryKey, placeholderData });
}

export { useAppQuery };
