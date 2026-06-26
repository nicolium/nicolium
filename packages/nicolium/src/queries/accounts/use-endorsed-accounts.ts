import { useQueryClient } from '@tanstack/react-query';

import { batcher } from '@/api/batcher';
import { useClient } from '@/hooks/use-client';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryKeys } from '@/queries/keys';
import { scopedQueryKey, useAppQuery } from '@/queries/query';

const useEndorsedAccounts = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useAppQuery({
    queryKey: queryKeys.accountsLists.endorsedAccounts(accountId),
    queryFn: () =>
      client.accounts.getAccountEndorsements(accountId).then(({ items: accounts }) => {
        const fetcher = batcher.relationships(client).fetch;

        for (const account of accounts) {
          fetcher(account.id);
          queryClient.setQueryData(
            scopedQueryKey(queryKeys.accounts.show(account.id), scopeUrl),
            account,
          );
        }

        return accounts.map(({ id }) => id);
      }),
  });
};

export { useEndorsedAccounts };
