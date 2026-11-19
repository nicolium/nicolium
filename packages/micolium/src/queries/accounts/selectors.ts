import { queryClient } from '@/queries/client';
import { queryKeys, scopedQueryKey } from '@/queries/keys';

const selectAccount = (accountId: string, scopeUrl: string) =>
  queryClient.getQueryData(scopedQueryKey(queryKeys.accounts.show(accountId), scopeUrl));

export { selectAccount };
