import { notifyManager, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/contexts/current-account-context';
import { useScopeUrl } from '@/hooks/use-scope-url';

import { queryKeys } from '../keys';
import { scopedQueryKey, useAppInfiniteQuery } from '../query';

import type { SearchAccountParams } from 'pl-api';

const useAccountSearch = (query: string, params?: Omit<SearchAccountParams, 'offset'>) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  let trimmedQuery = query.trim();
  if (trimmedQuery.startsWith('@')) trimmedQuery = trimmedQuery.slice(1);

  return useAppInfiniteQuery({
    queryKey: queryKeys.search.accountSearch(trimmedQuery, params),
    queryFn: ({ pageParam: offset, signal }) =>
      client.accounts
        .searchAccounts(
          trimmedQuery,
          {
            ...params,
            offset,
          },
          { signal },
        )
        .then((accounts) => {
          notifyManager.batch(() => {
            for (const account of accounts) {
              queryClient.setQueryData(
                scopedQueryKey(queryKeys.accounts.show(account.id), scopeUrl),
                account,
              );
            }
          });
          return accounts.map(({ id }) => id);
        }),
    enabled: !!trimmedQuery,
    initialPageParam: 0,
    getNextPageParam: (_, allPages) => allPages.flat().length,
    select: (data) => data.pages.flat(),
  });
};

export { useAccountSearch };
