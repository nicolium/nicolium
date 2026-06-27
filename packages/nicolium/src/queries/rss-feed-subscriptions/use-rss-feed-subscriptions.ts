import { useMutation } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { scopedQueryKey, useAppQuery } from '@/queries/query';

import { queryClient } from '../client';
import { queryKeys } from '../keys';

const useRssFeedSubscriptions = () => {
  const client = useClient();

  return useAppQuery({
    queryKey: queryKeys.rssFeedSubscriptions.all,
    queryFn: () => client.rssFeedSubscriptions.fetchRssFeedSubscriptions(),
  });
};

const useCreateRssFeedSubscription = () => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['rss-feed-subscriptions'],
    mutationFn: (url: string) => client.rssFeedSubscriptions.createRssFeedSubscription(url),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.rssFeedSubscriptions.all, scopeUrl),
      }),
  });
};

const useDeleteRssFeedSubscription = () => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['rss-feed-subscriptions'],
    mutationFn: (url: string) => client.rssFeedSubscriptions.deleteRssFeedSubscription(url),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.rssFeedSubscriptions.all, scopeUrl),
      }),
  });
};

export { useRssFeedSubscriptions, useCreateRssFeedSubscription, useDeleteRssFeedSubscription };
