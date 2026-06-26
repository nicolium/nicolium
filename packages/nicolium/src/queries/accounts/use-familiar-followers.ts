import { useQueryClient } from '@tanstack/react-query';

import { batcher } from '@/api/batcher';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryKeys } from '@/queries/keys';
import { scopedQueryKey, useAppQuery } from '@/queries/query';

const useFamiliarFollowers = (accountId: string) => {
  const client = useClient();
  const features = useFeatures();
  const { isLoggedIn } = useLoggedIn();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useAppQuery({
    queryKey: queryKeys.accountsLists.familiarFollowers(accountId),
    queryFn: () =>
      batcher
        .familiarFollowers(client)
        .fetch(accountId)
        .then(({ accounts }) => {
          for (const account of accounts) {
            queryClient.setQueryData(
              scopedQueryKey(queryKeys.accounts.show(account.id), scopeUrl),
              account,
            );
          }
          return accounts.map(({ id }) => id);
        }),
    enabled: isLoggedIn && features.familiarFollowers,
  });
};

export { useFamiliarFollowers };
