import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';

const selectAccount = (accountId: string) =>
  queryClient.getQueryData(queryKeys.accounts.show(accountId));

export { selectAccount };
