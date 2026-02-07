import { useQuery } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';

const useTrendingLinks = () => {
  const client = useClient();
  const features = useFeatures();

  return useQuery({
    queryKey: ['trends', 'links'],
    queryFn: () => client.trends.getTrendingLinks(),
    enabled: features.trendingLinks,
  });
};

export { useTrendingLinks };
