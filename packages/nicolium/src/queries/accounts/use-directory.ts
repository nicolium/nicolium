import { notifyManager, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryKeys } from '@/queries/keys';

import { scopedQueryKey, useAppInfiniteQuery } from '../query';

const useDirectory = (order: 'active' | 'new', local: boolean = false) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useAppInfiniteQuery({
    queryKey: queryKeys.accountsLists.directory(order, local),
    queryFn: ({ pageParam: offset }) =>
      client.instance
        .profileDirectory({
          order,
          local,
          offset,
        })
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
    initialPageParam: 0,
    getNextPageParam: (_, allPages) =>
      allPages.at(-1)?.length === 0 ? undefined : allPages.flat().length,
    select: (data) => data?.pages.flat(),
  });
};

export { useDirectory };
