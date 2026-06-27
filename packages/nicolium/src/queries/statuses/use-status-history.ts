import { useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { scopedQueryKey, useAppQuery } from '@/queries/query';

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
  const scopeUrl = useScopeUrl();

  return useAppQuery({
    queryKey: queryKeys.statuses.history(statusId),
    queryFn: async () => {
      const history = await client.statuses.getStatusHistory(statusId);
      // All entries include a current version of the same account.
      const account = history[0]?.account;
      if (account) {
        queryClient.setQueryData(
          scopedQueryKey(queryKeys.accounts.show(account.id), scopeUrl),
          account,
        );
      }
      return history.map(minifyStatusEdit);
    },
  });
};

export { useStatusHistory, type MinifiedStatusEdit };
