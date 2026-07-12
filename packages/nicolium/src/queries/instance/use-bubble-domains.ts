import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useAppQuery } from '@/queries/query';

import { queryKeys } from '../keys';

const useBubbleDomains = () => {
  const client = useClient();
  const features = useFeatures();

  return useAppQuery({
    queryKey: queryKeys.instance.bubbleDomains,
    queryFn: () => client.instance.getInstanceBubbleDomains(),
    placeholderData: [],
    enabled: features.bubbleDomainList,
  });
};

export { useBubbleDomains };
