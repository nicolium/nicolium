import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { useAuthStore } from '@/stores/auth';

const selectAccount = (accountId: string) =>
  queryClient.getQueryData(queryKeys.accounts.show(accountId));

const selectOwnAccount = () => {
  const accountId = useAuthStore.getState().currentAccountId;
  if (typeof accountId === 'string') {
    return selectAccount(accountId);
  }
};

export { selectAccount, selectOwnAccount };
