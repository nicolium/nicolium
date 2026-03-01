import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';

import { queryKeys } from '../keys';

import type { StatusEdit } from 'pl-api';

const minifyStatusEdit = ({ account, ...statusEdit }: StatusEdit) => ({
  account_id: account.id,
  ...statusEdit,
});

type MinifiedStatusEdit = ReturnType<typeof minifyStatusEdit>;

const useStatusHistory = (statusId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.statuses.history(statusId),
    queryFn: async () => {
      const history = await client.statuses.getStatusHistory(statusId);
      // All entries include a current version of the same account.
      const account = history[0]?.account;
      if (account) {
        queryClient.setQueryData(queryKeys.accounts.show(account.id), account);
      }
      return history.map(minifyStatusEdit);
    },
  });
};

export { useStatusHistory, type MinifiedStatusEdit };
