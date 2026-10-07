import { useClient, useFeatures } from '@/contexts/current-account-context';
import { useAppQuery } from '@/queries/query';
import { useImportEntities } from '@/queries/utils/import-entities';

import { queryKeys } from '../keys';

const useTrendingStatuses = (enabled?: boolean) => {
  const client = useClient();
  const importEntities = useImportEntities();
  const features = useFeatures();

  const fetchTrendingStatuses = async () => {
    const response = await client.trends.getTrendingStatuses();

    importEntities({ statuses: response });

    return response.map(({ id }) => id);
  };

  return useAppQuery({
    queryKey: queryKeys.trends.statuses,
    queryFn: fetchTrendingStatuses,
    enabled: enabled !== false && features.trendingStatuses,
  });
};

export { useTrendingStatuses };
