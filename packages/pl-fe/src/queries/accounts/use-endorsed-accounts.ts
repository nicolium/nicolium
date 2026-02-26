import { useQuery, useQueryClient } from '@tanstack/react-query';

import { batcher } from '@/api/batcher';
import { useClient } from '@/hooks/use-client';

const useEndorsedAccounts = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['accountsLists', 'endorsedAccounts', accountId],
    queryFn: () =>
      client.accounts.getAccountEndorsements(accountId).then(({ items: accounts }) => {
        const fetcher = batcher.relationships(client).fetch;

        for (const account of accounts) {
          fetcher(account.id);
          queryClient.setQueryData(['accounts', account.id], account);
        }

        return accounts.map(({ id }) => id);
      }),
  });
};

export { useEndorsedAccounts };
