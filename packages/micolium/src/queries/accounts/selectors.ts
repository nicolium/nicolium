import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { scopedQueryKey } from '@/queries/query';

const selectAccount = (accountId: string, scopeUrl: string) =>
  queryClient.getQueryData(scopedQueryKey(queryKeys.accounts.show(accountId), scopeUrl));

export { selectAccount };
