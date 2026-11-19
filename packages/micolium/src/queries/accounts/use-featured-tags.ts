import { useClient, useFeatures } from '@/contexts/current-account-context';
import { queryKeys } from '@/queries/keys';
import { useAppQuery } from '@/queries/query';

const useFeaturedTags = (accountId?: string) => {
  const client = useClient();
  const features = useFeatures();

  return useAppQuery({
    queryKey: queryKeys.accounts.featuredTags(accountId!),
    queryFn: () => client.accounts.getAccountFeaturedTags(accountId!),
    enabled: features.featuredTags && !!accountId,
  });
};

export { useFeaturedTags };
