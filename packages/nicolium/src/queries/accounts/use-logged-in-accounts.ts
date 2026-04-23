import { skipToken, useQueries, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useCurrentAccount } from '@/contexts/current-account-context';
import { queryKeys } from '@/queries/keys';
import { useAuthStore } from '@/stores/auth';
import { validId } from '@/utils/auth';

import type { Account } from 'pl-api';

const useLoggedInAccount = (accountId: string) => {
  const query = useQuery<Account>({
    queryKey: queryKeys.accounts.show(accountId),
    queryFn: skipToken,
  });

  return query;
};

const useLoggedInAccountIds = () => {
  const users = useAuthStore((state) => state.users);
  const currentAccountId = useCurrentAccount();

  return useMemo(
    () =>
      Object.values(users)
        .map((authUser) => authUser?.id)
        .filter((id): id is string => validId(id) && id !== currentAccountId),
    [users, currentAccountId],
  );
};

/** doesn't fetch because it's a hack that should not exist like this */
const useLoggedInAccounts = () => {
  const otherAccountIds = useLoggedInAccountIds();

  const { accounts } = useQueries({
    queries: otherAccountIds.map((accountId) => ({
      queryKey: queryKeys.accounts.show(accountId),
      queryFn: skipToken,
    })),
    combine: (results) => ({
      accounts: results.map((q) => q.data).filter((account): account is Account => !!account),
    }),
  });

  return { accounts };
};

export { useLoggedInAccount, useLoggedInAccountIds, useLoggedInAccounts };
