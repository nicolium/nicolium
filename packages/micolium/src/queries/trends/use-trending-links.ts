import { useClient, useFeatures } from '@/contexts/current-account-context';
import { useAppQuery } from '@/queries/query';

import { queryKeys } from '../keys';

const useTrendingLinks = (enabled = true) => {
  const client = useClient();
  const features = useFeatures();

  return useAppQuery({
    queryKey: queryKeys.trends.links,
    queryFn: () => client.trends.getTrendingLinks(),
    enabled: enabled && features.trendingLinks,
  });
};

export { useTrendingLinks };
