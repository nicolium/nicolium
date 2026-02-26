import { useMutation, useQuery } from '@tanstack/react-query';

import { batcher } from '@/api/batcher';
import { useClient } from '@/hooks/use-client';
import { useLoggedIn } from '@/hooks/use-logged-in';

import { queryClient } from '../client';
import { queryKeys } from '../keys';

import type { GroupRelationship } from 'pl-api';

const useGroupRelationshipQuery = (groupId?: string) => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();

  return useQuery({
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

  return useMutation({
    mutationKey: ['groupRelationships', id, 'join'],
    mutationFn: () => client.experimental.groups.joinGroup(id),
    onMutate: () => {
      let previousRelationship: GroupRelationship | undefined = undefined;

      queryClient.setQueryData<GroupRelationship>(
        queryKeys.groupRelationships.show(id),
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
        queryClient.setQueryData<GroupRelationship>(
          ['groupRelationships', id],
          previousRelationship,
        );
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData<GroupRelationship>(queryKeys.groupRelationships.show(id), data);
    },
  });
};

const useLeaveGroupMutation = (id: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['groupRelationships', id, 'leave'],
    mutationFn: () => client.experimental.groups.leaveGroup(id),
    onMutate: () => {
      let previousRelationship: GroupRelationship | undefined = undefined;

      queryClient.setQueryData<GroupRelationship>(
        queryKeys.groupRelationships.show(id),
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
        queryClient.setQueryData<GroupRelationship>(
          ['groupRelationships', id],
          previousRelationship,
        );
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData<GroupRelationship>(queryKeys.groupRelationships.show(id), data);
    },
  });
};

export { useGroupRelationshipQuery, useJoinGroupMutation, useLeaveGroupMutation };
