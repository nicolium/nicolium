import { useClient, useFeatures } from '@/contexts/current-account-context';
import { queryKeys } from '@/queries/keys';
import { useAppQuery } from '@/queries/query';

import type { Tag } from 'pl-api';

const useTrendingTags = (enabled = true) => {
  const client = useClient();
  const features = useFeatures();

  return useAppQuery<ReadonlyArray<Tag>>({
    queryKey: queryKeys.trends.tags,
    queryFn: () => client.trends.getTrendingTags(),
    placeholderData: [],
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: enabled && features.trends,
  });
};

export { useTrendingTags as default };
