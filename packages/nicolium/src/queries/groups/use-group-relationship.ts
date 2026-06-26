import { useMutation } from '@tanstack/react-query';

import { batcher } from '@/api/batcher';
import { useClient } from '@/hooks/use-client';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { scopedQueryKey, useAppQuery } from '@/queries/query';

import { queryClient } from '../client';
import { queryKeys } from '../keys';

import type { GroupRelationship } from 'pl-api';

const useGroupRelationshipQuery = (groupId?: string) => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();

  return useAppQuery({
    queryKey: queryKeys.groupRelationships.show(groupId!),
    queryFn: () =>
      batcher
        .groupRelationships(client)
        .fetch(groupId!)
        .then((data) => data || undefined),
    enabled: isLoggedIn && !!groupId,
  });
};

const useJoinGroupMutation = (id: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['groupRelationships', id, 'join'],
    mutationFn: () => client.experimental.groups.joinGroup(id),
    onMutate: () => {
      let previousRelationship: GroupRelationship | undefined = undefined;

      queryClient.setQueryData(
        scopedQueryKey(queryKeys.groupRelationships.show(id), scopeUrl),
        (relationship) => {
          previousRelationship = relationship;
          if (!relationship) return undefined;
          return {
            ...relationship,
            requested: true,
          };
        },
      );

      return previousRelationship;
    },
    onError: (_, __, previousRelationship) => {
      if (previousRelationship) {
        queryClient.setQueryData(
          scopedQueryKey(queryKeys.groupRelationships.show(id), scopeUrl),
          previousRelationship,
        );
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.groupRelationships.show(id), scopeUrl),
        data,
      );
    },
  });
};

const useLeaveGroupMutation = (id: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['groupRelationships', id, 'leave'],
    mutationFn: () => client.experimental.groups.leaveGroup(id),
    onMutate: () => {
      let previousRelationship: GroupRelationship | undefined = undefined;

      queryClient.setQueryData(
        scopedQueryKey(queryKeys.groupRelationships.show(id), scopeUrl),
        (relationship) => {
          previousRelationship = relationship;
          if (!relationship) return undefined;
          return {
            ...relationship,
            requested: false,
            member: false,
            role: undefined,
          };
        },
      );

      return previousRelationship;
    },
    onError: (_, __, previousRelationship) => {
      if (previousRelationship) {
        queryClient.setQueryData(
          scopedQueryKey(queryKeys.groupRelationships.show(id), scopeUrl),
          previousRelationship,
        );
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.groupRelationships.show(id), scopeUrl),
        data,
      );
    },
  });
};

export { useGroupRelationshipQuery, useJoinGroupMutation, useLeaveGroupMutation };
