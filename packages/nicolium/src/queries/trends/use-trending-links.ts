import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useAppQuery } from '@/queries/query';

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
