import { useQuery } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { queryKeys } from '@/queries/keys';

import type { Tag } from 'pl-api';

const useTrends = () => {
  const client = useClient();
  const features = useFeatures();
  const { isLoggedIn } = useLoggedIn();

  return useQuery<ReadonlyArray<Tag>>({
    queryKey: queryKeys.trends.tags,
    queryFn: () => client.trends.getTrendingTags(),
    placeholderData: [],
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: isLoggedIn && features.trends,
  });
};

export { useTrends as default };
