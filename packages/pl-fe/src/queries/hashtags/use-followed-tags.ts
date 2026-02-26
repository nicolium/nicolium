import { useMutation } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';

import { queryClient } from '../client';
import { queryKeys } from '../keys';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';

const useFollowedTags = makePaginatedResponseQuery(['followedTags'], (client) =>
  client.myAccount.getFollowedTags(),
);

const useFollowHashtagMutation = (tag: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['followedTags', tag.toLocaleLowerCase()],
    mutationFn: () => client.myAccount.followTag(tag),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.followedTags.all,
      });
      queryClient.setQueryData(queryKeys.hashtags.show(tag.toLocaleLowerCase()), data);
    },
  });
};

const useUnfollowHashtagMutation = (tag: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['followedTags', tag.toLocaleLowerCase()],
    mutationFn: () => client.myAccount.unfollowTag(tag),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.followedTags.all,
      });
      queryClient.setQueryData(queryKeys.hashtags.show(tag.toLocaleLowerCase()), data);
    },
  });
};

export { useFollowedTags, useFollowHashtagMutation, useUnfollowHashtagMutation };
