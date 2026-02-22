import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useClient } from '@/hooks/use-client';

import { useGroupRelationshipQuery } from './use-group-relationship';

const useGroupQuery = (groupId?: string, withRelationship = true) => {
  const client = useClient();

  const groupQuery = useQuery({
    queryKey: ['groups', groupId],
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

export { useGroupQuery };
