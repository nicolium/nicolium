import { useQuery } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { queryKeys } from '@/queries/keys';

const useAccountScrobbleQuery = (accountId?: string) => {
  const client = useClient();
  const features = useFeatures();

  return useQuery({
    queryKey: queryKeys.scrobbles.show(accountId!),
    queryFn: async () =>
      (await client.accounts.getScrobbles(accountId!, { limit: 1 })).items[0] || null,
    placeholderData: undefined,
    enabled: () => !!accountId && features.scrobbles,
    staleTime: 3 * 60 * 1000,
  });
};

export { useAccountScrobbleQuery };
