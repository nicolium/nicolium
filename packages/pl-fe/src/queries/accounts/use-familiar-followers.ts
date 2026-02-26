import { useQuery, useQueryClient } from '@tanstack/react-query';

import { batcher } from '@/api/batcher';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';

const useFamiliarFollowers = (accountId: string) => {
  const client = useClient();
  const features = useFeatures();
  const { isLoggedIn } = useLoggedIn();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['accountsLists', 'familiarFollowers', accountId],
    queryFn: () =>
      batcher
        .familiarFollowers(client)
        .fetch(accountId)
        .then(({ accounts }) => {
          for (const account of accounts) {
            queryClient.setQueryData(['accounts', account.id], account);
          }
          result.accounts.map(({ id }) => id);
        }),
    enabled: isLoggedIn && features.familiarFollowers,
  });
};

export { useFamiliarFollowers };
