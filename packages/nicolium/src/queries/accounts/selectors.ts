import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';

import type { RootState } from '@/store';

const selectAccount = (accountId: string) =>
  queryClient.getQueryData(queryKeys.accounts.show(accountId));

const selectOwnAccount = (state: RootState) => {
  if (state.me) {
    return selectAccount(state.me);
  }
};

export { selectAccount, selectOwnAccount };
