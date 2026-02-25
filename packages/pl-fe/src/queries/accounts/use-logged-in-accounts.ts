import { skipToken, useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useAppSelector } from '@/hooks/use-app-selector';
import { validId } from '@/utils/auth';

import type { Account } from 'pl-api';

/** doesn't fetch because it's a hack that should not exist like this */
const useLoggedInAccounts = () => {
  const { me, accountIds } = useAppSelector((state) => ({
    me: state.me,
    accountIds: Object.values(state.auth.users)
      .map((authUser) => authUser?.id)
      .filter((id): id is string => validId(id)),
  }));

  const otherAccountIds = useMemo(() => accountIds.filter((id) => id !== me), [accountIds, me]);

  const queries = useQueries({
    queries: otherAccountIds.map((accountId) => ({
      queryKey: ['accounts', accountId] as const,
      queryFn: skipToken,
    })),
  });

  const accounts = useMemo(
    () => queries.map((q) => q.data).filter((account): account is Account => !!account),
    [queries],
  );

  return { accounts };
};

export { useLoggedInAccounts };
