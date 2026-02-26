import { useQuery } from '@tanstack/react-query';

import { importEntities } from '@/actions/importer';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';

import { queryKeys } from '../keys';

const useTrendingStatuses = () => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const features = useFeatures();

  const fetchTrendingStatuses = async () => {
    const response = await client.trends.getTrendingStatuses();

    dispatch(importEntities({ statuses: response }));

    return response.map(({ id }) => id);
  };

  return useQuery({
    queryKey: queryKeys.trends.statuses,
    queryFn: fetchTrendingStatuses,
    enabled: features.trendingStatuses,
  });
};

export { useTrendingStatuses };
