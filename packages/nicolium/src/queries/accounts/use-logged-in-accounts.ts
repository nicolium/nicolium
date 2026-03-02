import { skipToken, useQueries, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createSelector } from 'reselect';

import { useAppSelector } from '@/hooks/use-app-selector';
import { queryKeys } from '@/queries/keys';
import { validId } from '@/utils/auth';

import type { RootState } from '@/store';
import type { Account } from 'pl-api';

const selectOtherAccountIds = createSelector(
  (state: RootState) => state.auth.users,
  (state: RootState) => state.me,
  (users, me) =>
    Object.values(users)
      .map((authUser) => authUser?.id)
      .filter((id): id is string => validId(id) && id !== me),
);

const useLoggedInAccount = (accountId: string) => {
  const query = useQuery({
    queryKey: queryKeys.accounts.show(accountId),
    queryFn: skipToken,
  });

  return query;
};

const useLoggedInAccountIds = () => useAppSelector((state) => selectOtherAccountIds(state));

/** doesn't fetch because it's a hack that should not exist like this */
const useLoggedInAccounts = () => {
  const otherAccountIds = useLoggedInAccountIds();

  const queries = useQueries({
    queries: otherAccountIds.map((accountId) => ({
      queryKey: queryKeys.accounts.show(accountId),
      queryFn: skipToken,
    })),
  });

  const accounts = useMemo(
    () => queries.map((q) => q.data).filter((account): account is Account => !!account),
    [queries],
  );

  return { accounts };
};

export { useLoggedInAccount, useLoggedInAccountIds, useLoggedInAccounts };
