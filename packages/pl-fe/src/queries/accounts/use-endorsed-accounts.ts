import { useQuery } from '@tanstack/react-query';

import { importEntities } from '@/actions/importer';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useClient } from '@/hooks/use-client';

const useEndorsedAccounts = (accountId: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: ['accountsLists', 'endorsedAccounts', accountId],
    queryFn: () => client.accounts.getAccountEndorsements(accountId).then(({ items: accounts }) => {
      dispatch(importEntities({ accounts }));
      return accounts.map(({ id }) => id);
    }),
  });
};

export { useEndorsedAccounts };
