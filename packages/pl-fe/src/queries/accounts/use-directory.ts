import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { queryKeys } from '@/queries/keys';

const useDirectory = (order: 'active' | 'new', local: boolean = false) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useInfiniteQuery({
    queryKey: queryKeys.accountsLists.directory(order, local),
    queryFn: ({ pageParam: offset }) =>
      client.instance
        .profileDirectory({
          order,
          local,
          offset,
        })
        .then((accounts) => {
          for (const account of accounts) {
            queryClient.setQueryData(queryKeys.accounts.show(account.id), account);
          }
          return accounts.map(({ id }) => id);
        }),
    initialPageParam: 0,
    getNextPageParam: (_, allPages) =>
      allPages.at(-1)?.length === 0 ? undefined : allPages.flat().length,
    select: (data) => data?.pages.flat(),
  });
};

export { useDirectory };
