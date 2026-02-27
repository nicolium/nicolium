import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useClient } from '@/hooks/use-client';

import { queryKeys } from '../keys';

import { useGroupRelationshipQuery } from './use-group-relationship';

import type { CreateGroupParams, UpdateGroupParams } from 'pl-api';

const useGroupQuery = (groupId?: string, withRelationship = true) => {
  const client = useClient();

  const groupQuery = useQuery({
    queryKey: queryKeys.groups.show(groupId!),
    queryFn: () => client.experimental.groups.getGroup(groupId!),
    enabled: !!groupId,
  });

  const relationshipQuery = useGroupRelationshipQuery(withRelationship ? groupId : undefined);

  return useMemo(
    () => ({
      ...groupQuery,
      data: groupQuery.data
        ? {
            ...groupQuery.data,
            relationship: relationshipQuery.data || null,
          }
        : undefined,
    }),
    [groupQuery.data, relationshipQuery.data],
  );
};

const useCreateGroupMutation = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['groups', 'create'],
    mutationFn: (params: CreateGroupParams) => client.experimental.groups.createGroup(params),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.groups.show(data.id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.groupLists.myGroups });
    },
  });
};

const useUpdateGroupMutation = (groupId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['groups', 'update'],
    mutationFn: (params: UpdateGroupParams) =>
      client.experimental.groups.updateGroup(groupId, params),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.groups.show(data.id), data);
    },
  });
};

const useDeleteGroupMutation = (groupId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['groups', 'delete'],
    mutationFn: () => client.experimental.groups.deleteGroup(groupId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.groups.show(groupId!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groupLists.myGroups });
    },
  });
};

export { useGroupQuery, useCreateGroupMutation, useUpdateGroupMutation, useDeleteGroupMutation };
