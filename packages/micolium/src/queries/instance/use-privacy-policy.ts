import { useClient, useFeatures } from '@/contexts/current-account-context';
import { useAppQuery } from '@/queries/query';

import { queryKeys } from '../keys';

const usePrivacyPolicy = () => {
  const client = useClient();
  const features = useFeatures();

  return useAppQuery({
    queryKey: queryKeys.instance.privacyPolicy,
    queryFn: () => client.instance.getInstancePrivacyPolicy(),
    enabled: features.instancePrivacyPolicy,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export { usePrivacyPolicy };
