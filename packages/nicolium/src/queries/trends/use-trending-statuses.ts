import { useQuery } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { importEntities } from '@/queries/utils/import-entities';

import { queryKeys } from '../keys';

const useTrendingStatuses = () => {
  const client = useClient();
  const features = useFeatures();

  const fetchTrendingStatuses = async () => {
    const response = await client.trends.getTrendingStatuses();

    importEntities({ statuses: response });

    return response.map(({ id }) => id);
  };

  return useQuery({
    queryKey: queryKeys.trends.statuses,
    queryFn: fetchTrendingStatuses,
    enabled: features.trendingStatuses,
  });
};

export { useTrendingStatuses };
