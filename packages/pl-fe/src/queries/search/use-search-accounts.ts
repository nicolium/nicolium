import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';

import type { SearchAccountParams } from 'pl-api';

const useAccountSearch = (query: string, params?: Omit<SearchAccountParams, 'offset'>) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useInfiniteQuery({
    queryKey: ['search', 'accountSearch', query.trim(), params],
    queryFn: ({ pageParam: offset, signal }) =>
      client.accounts
        .searchAccounts(
          query.trim(),
          {
            ...params,
            offset,
          },
          { signal },
        )
        .then((accounts) => {
          for (const account of accounts) {
            queryClient.setQueryData(['accounts', account.id], account);
          }
          return accounts.map(({ id }) => id);
        }),
    enabled: !!query?.trim(),
    initialPageParam: 0,
    getNextPageParam: (_, allPages) => allPages.flat().length,
    select: (data) => data.pages.flat(),
  });
};

export { useAccountSearch };
