import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useClient } from '@/hooks/use-client';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { scopedQueryKey, useAppQuery } from '@/queries/query';

import { queryKeys } from '../keys';

import { useGroupRelationshipQuery } from './use-group-relationship';

import type { CreateGroupParams, UpdateGroupParams } from 'pl-api';

const useGroupQuery = (groupId?: string, withRelationship = true) => {
  const client = useClient();

  const groupQuery = useAppQuery({
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
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['groups', 'create'],
    mutationFn: (params: CreateGroupParams) => client.experimental.groups.createGroup(params),
    onSuccess: (data) => {
      queryClient.setQueryData(scopedQueryKey(queryKeys.groups.show(data.id), scopeUrl), data);
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.groupLists.myGroups, scopeUrl),
      });
    },
  });
};

const useUpdateGroupMutation = (groupId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['groups', 'update'],
    mutationFn: (params: UpdateGroupParams) =>
      client.experimental.groups.updateGroup(groupId, params),
    onSuccess: (data) => {
      queryClient.setQueryData(scopedQueryKey(queryKeys.groups.show(data.id), scopeUrl), data);
    },
  });
};

const useDeleteGroupMutation = (groupId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['groups', 'delete'],
    mutationFn: () => client.experimental.groups.deleteGroup(groupId),
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: scopedQueryKey(queryKeys.groups.show(groupId!), scopeUrl),
      });
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.groupLists.myGroups, scopeUrl),
      });
    },
  });
};

export { useGroupQuery, useCreateGroupMutation, useUpdateGroupMutation, useDeleteGroupMutation };
