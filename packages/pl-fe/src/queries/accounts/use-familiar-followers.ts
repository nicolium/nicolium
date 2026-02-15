import { useQuery } from '@tanstack/react-query';

import { importEntities } from '@/actions/importer';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';

const useFamiliarFollowers = (accountId: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const { isLoggedIn } = useLoggedIn();

  return useQuery({
    queryKey: ['accountsLists', 'familiarFollowers', accountId],
    queryFn: () =>
      client.accounts.getFamiliarFollowers([accountId]).then((response) => {
        const result = response.find(({ id }) => id === accountId);
        if (!result) return [];

        dispatch(importEntities({ accounts: result.accounts }));
        return result.accounts.map(({ id }) => id);
      }),
    enabled: isLoggedIn && features.familiarFollowers,
  });
};

export { useFamiliarFollowers };
