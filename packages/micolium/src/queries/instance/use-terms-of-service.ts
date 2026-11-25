import { useClient, useFeatures } from '@/contexts/current-account-context';
import { useAppQuery } from '@/queries/query';

import { queryKeys } from '../keys';

const useTermsOfService = () => {
  const client = useClient();
  const features = useFeatures();

  return useAppQuery({
    queryKey: queryKeys.instance.termsOfService,
    queryFn: () => client.instance.getInstanceTermsOfService(),
    enabled: features.instanceTermsOfService,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export { useTermsOfService };
