import { useQuery } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { queryKeys } from '@/queries/keys';

import type { Scrobble } from 'pl-api';

const minifyScrobble = ({ account, ...scrobble }: Scrobble) => scrobble;

type MinifiedScrobble = ReturnType<typeof minifyScrobble>;

const useAccountScrobbleQuery = (accountId?: string) => {
  const client = useClient();
  const features = useFeatures();

  return useQuery({
    queryKey: queryKeys.scrobbles.show(accountId!),
    queryFn: async () => {
      const scrobbles = await client.accounts.getScrobbles(accountId!, { limit: 1 });

      return scrobbles.items.length > 0 ? minifyScrobble(scrobbles.items[0]) : null;
    },
    placeholderData: undefined,
    enabled: () => !!accountId && features.scrobbles,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

export { useAccountScrobbleQuery, type MinifiedScrobble };
