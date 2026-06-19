import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { queryKeys } from '@/queries/keys';
import { useAppQuery } from '@/queries/query';

import type { Tag } from 'pl-api';

const useTrendingTags = () => {
  const client = useClient();
  const features = useFeatures();
  const { isLoggedIn } = useLoggedIn();

  return useAppQuery<ReadonlyArray<Tag>>({
    queryKey: queryKeys.trends.tags,
    queryFn: () => client.trends.getTrendingTags(),
    placeholderData: [],
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: isLoggedIn && features.trends,
  });
};

export { useTrendingTags as default };
