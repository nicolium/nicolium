import { useQuery } from '@tanstack/react-query';

import { usePlHooksApiClient } from '@/contexts/api-client';
import { usePlHooksQueryClient } from '@/contexts/query-client';

const useAccountRelationship = (accountId?: string) => {
  const { client } = usePlHooksApiClient();
  const queryClient = usePlHooksQueryClient();

  return useQuery(
    {
      queryKey: ['relationships', 'entities', accountId],
      queryFn: async () => (await client.accounts.getRelationships([accountId!]))[0],
      enabled: !!accountId,
    },
    queryClient,
  );
};

export { useAccountRelationship };
