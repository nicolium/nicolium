import { useMutation } from '@tanstack/react-query';

import { useCurrentAccount } from '@/contexts/current-account-context';
import { useClient } from '@/stores/auth';

import { queryClient } from '../client';
import { queryKeys } from '../keys';
import { scopedQueryKey } from '../query';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';

const useFollowedTags = makePaginatedResponseQuery(queryKeys.followedTags.all, (client) =>
  client.myAccount.getFollowedTags(),
);

const useFollowHashtagMutation = (tag: string) => {
  const client = useClient();
  const scopeUrl = useCurrentAccount();

  return useMutation({
    mutationKey: ['followedTags', tag.toLocaleLowerCase()],
    mutationFn: () => client.myAccount.followTag(tag),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.followedTags.all, scopeUrl),
      });
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.hashtags.show(tag.toLocaleLowerCase()), scopeUrl),
        data,
      );
    },
  });
};

const useUnfollowHashtagMutation = (tag: string) => {
  const client = useClient();
  const scopeUrl = useCurrentAccount();

  return useMutation({
    mutationKey: ['followedTags', tag.toLocaleLowerCase()],
    mutationFn: () => client.myAccount.unfollowTag(tag),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.followedTags.all, scopeUrl),
      });
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.hashtags.show(tag.toLocaleLowerCase()), scopeUrl),
        data,
      );
    },
  });
};

export { useFollowedTags, useFollowHashtagMutation, useUnfollowHashtagMutation };
