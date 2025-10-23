import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';
import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';

import type { FollowAccountParams, Relationship } from 'pl-api';

const useRelationshipQuery = (accountId?: string) => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();

  return useQuery({
    queryKey: ['accountRelationships', accountId],
    queryFn: () => client.accounts.getRelationships([accountId!]).then(arr => arr[0]),
    enabled: isLoggedIn && !!accountId,
  });
};

const useFollowMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['accountRelationships', accountId],
    mutationFn: (params?: FollowAccountParams) => client.accounts.followAccount(accountId, params),
    onMutate: (params) => {
      const previousRelationship = queryClient.getQueryData<Relationship>(['accountRelationships', accountId])!;

      if (!previousRelationship) return;

      const newRelationship: Relationship = {
        ...previousRelationship,
        requested: !previousRelationship.following,
        notifying: params?.notify ?? previousRelationship.notifying,
        showing_reblogs: params?.reblogs ?? previousRelationship.showing_reblogs,
      };

      queryClient.setQueryData(['accountRelationships', accountId], newRelationship);

      return { previousRelationship };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousRelationship) {
        queryClient.setQueryData(['accountRelationships', accountId], context.previousRelationship);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['accountRelationships', accountId], data);
    },
  });
};

const useUnfollowMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['accountRelationships', accountId],
    mutationFn: () => client.accounts.unfollowAccount(accountId),
    onMutate: () => {
      const previousRelationship = queryClient.getQueryData<Relationship>(['accountRelationships', accountId])!;

      if (!previousRelationship) return;
      const newRelationship: Relationship = {
        ...previousRelationship,
        following: false,
        requested: false,
        notifying: false,
        showing_reblogs: false,
      };

      queryClient.setQueryData(['accountRelationships', accountId], newRelationship);

      return { previousRelationship };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousRelationship) {
        queryClient.setQueryData(['accountRelationships', accountId], context.previousRelationship);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['accountRelationships', accountId], data);
    },
  });
};

export { useRelationshipQuery, useFollowMutation, useUnfollowMutation };
