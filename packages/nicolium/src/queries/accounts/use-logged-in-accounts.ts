import { skipToken } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useCurrentAccount } from '@/contexts/current-account-context';
import { queryKeys } from '@/queries/keys';
import { useAppQuery } from '@/queries/query';
import { useAuthStore } from '@/stores/auth';

import type { Account } from 'pl-api';

const useLoggedInAccount = (accountId: string) => {
  const query = useAppQuery<Account>({
    queryKey: queryKeys.accounts.show(accountId),
    queryFn: skipToken,
  });

  return query;
};

const useLoggedInAccountUrls = () => {
  const users = useAuthStore((state) => state.users);
  const currentAccountId = useCurrentAccount();

  return useMemo(
    () => Object.keys(users).filter((url) => users[url].id && users[url].id !== currentAccountId),
    [users, currentAccountId],
  );
};

export { useLoggedInAccount, useLoggedInAccountUrls };
