import { useMutation, useQuery } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';

import { queryClient } from '../client';
import { queryKeys } from '../keys';

const useRssFeedSubscriptions = () => {
  const client = useClient();

  return useQuery({
    queryKey: queryKeys.rssFeedSubscriptions.all,
    queryFn: () => client.rssFeedSubscriptions.fetchRssFeedSubscriptions(),
  });
};

const useCreateRssFeedSubscription = () => {
  const client = useClient();

  return useMutation({
    mutationKey: ['rss-feed-subscriptions'],
    mutationFn: (url: string) => client.rssFeedSubscriptions.createRssFeedSubscription(url),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.rssFeedSubscriptions.all }),
  });
};

const useDeleteRssFeedSubscription = () => {
  const client = useClient();

  return useMutation({
    mutationKey: ['rss-feed-subscriptions'],
    mutationFn: (url: string) => client.rssFeedSubscriptions.deleteRssFeedSubscription(url),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.rssFeedSubscriptions.all }),
  });
};

export { useRssFeedSubscriptions, useCreateRssFeedSubscription, useDeleteRssFeedSubscription };
