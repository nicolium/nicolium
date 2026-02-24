import { useQuery } from '@tanstack/react-query';

import { usePlHooksApiClient } from '@/contexts/api-client';
import { usePlHooksQueryClient } from '@/contexts/query-client';
import { importEntities } from '@/importer';
import { normalizeStatusEdit } from '@/normalizers/status-edit';

const useStatusHistory = (statusId: string) => {
  const queryClient = usePlHooksQueryClient();
  const { client } = usePlHooksApiClient();

  return useQuery(
    {
      queryKey: ['statuses', 'history', statusId],
      queryFn: () =>
        client.statuses
          .getStatusHistory(statusId)
          .then(
            (history) => (
              importEntities({ accounts: history.map(({ account }) => account) }), history
            ),
          )
          .then((history) => history.map(normalizeStatusEdit)),
    },
    queryClient,
  );
};

export { useStatusHistory };
