import { useAppQuery } from '@/queries/query';
import { useClient, useFeatures } from '@/stores/auth';

import { queryKeys } from '../keys';

const useTrendingLinks = () => {
  const client = useClient();
  const features = useFeatures();

  return useAppQuery({
    queryKey: queryKeys.trends.links,
    queryFn: () => client.trends.getTrendingLinks(),
    enabled: features.trendingLinks,
  });
};

export { useTrendingLinks };
