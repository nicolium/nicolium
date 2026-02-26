import { useQuery, useQueryClient } from '@tanstack/react-query';
import { StatusEdit } from 'pl-api';

import { useClient } from '@/hooks/use-client';

const minifyStatusEdit = ({ account, ...statusEdit }: StatusEdit) => ({
  account_id: account.id,
  ...statusEdit,
});

const useStatusHistory = (statusId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['statuses', 'history', statusId],
    queryFn: async () => {
      const history = await client.statuses.getStatusHistory(statusId);
      for (const { account } of history) {
        // why am i even doing this it's always the same account lol
        queryClient.setQueryData(['accounts', account.id], account);
      }
      return history.map(minifyStatusEdit);
    },
  });
};

export { useStatusHistory };
