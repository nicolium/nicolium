import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useClient } from '@/hooks/use-client';

import type { Account } from 'pl-api';

const useAccounts = (accountIds: Array<string>) => {
  const client = useClient();
  const queryClient = useQueryClient();

  const queries = useQueries({
    queries: accountIds.map((accountId) => ({
      queryKey: ['accounts', accountId],
      queryFn: async () => {
        const response = await client.accounts.getAccount(accountId);
        queryClient.setQueryData(['accounts', 'lookup', response.acct.toLowerCase()], response.id);
        return response;
      },
      enabled: !!accountId,
    })),
  });

  const accounts = useMemo(
    () => queries.map((query) => query.data).filter((account): account is Account => !!account),
    [queries],
  );

  return {
    accounts,
    isLoading: queries.some((query) => query.isLoading),
    isFetching: queries.some((query) => query.isFetching),
  };
};

export { useAccounts };
