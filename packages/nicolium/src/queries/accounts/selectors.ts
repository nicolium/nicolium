import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';

import type { RootState } from '@/store';
import type { Account } from 'pl-api';

const getAccounts = (): Array<Account> =>
  queryClient
    .getQueriesData<Account>({ queryKey: queryKeys.accounts.root })
    .map(([, account]) => account)
    .filter((account): account is Account => !!account && typeof account.id === 'string');

const selectAccount = (accountId: string) =>
  queryClient.getQueryData(queryKeys.accounts.show(accountId));

const selectOwnAccount = (state: RootState) => {
  if (state.me) {
    return selectAccount(state.me);
  }
};

export { getAccounts, selectAccount, selectOwnAccount };
