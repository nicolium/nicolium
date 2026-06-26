import { useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryKeys } from '@/queries/keys';
import { scopedQueryKey, useAppQueries } from '@/queries/query';

import type { Account } from 'pl-api';

const useAccounts = (accountIds: Array<string>) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useAppQueries({
    queries: accountIds.map((accountId) => ({
      queryKey: queryKeys.accounts.show(accountId),
      queryFn: async () => {
        const response = await client.accounts.getAccount(accountId);
        queryClient.setQueryData(
          scopedQueryKey(queryKeys.accounts.lookup(response.acct.toLowerCase()), scopeUrl),
          response.id,
        );
        return response;
      },
      enabled: !!accountId,
    })),
    combine: (results) => ({
      data: results.map((result) => result.data).filter((account): account is Account => !!account),
      isLoading: results.some((result) => result.isLoading),
      isFetching: results.some((result) => result.isFetching),
    }),
  });
};

export { useAccounts };
