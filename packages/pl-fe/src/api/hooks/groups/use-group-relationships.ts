import { Entities } from '@/entity-store/entities';
import { useBatchedEntities } from '@/entity-store/hooks/use-batched-entities';
import { useClient } from '@/hooks/use-client';
import { useLoggedIn } from '@/hooks/use-logged-in';

import type { GroupRelationship } from 'pl-api';

const useGroupRelationships = (listKey: string[], groupIds: string[]) => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();

  const fetchGroupRelationships = (groupIds: string[]) =>
    client.experimental.groups.getGroupRelationships(groupIds);

  const { entityMap: relationships, ...result } = useBatchedEntities<GroupRelationship>(
    [Entities.GROUP_RELATIONSHIPS, ...listKey],
    groupIds,
    fetchGroupRelationships,
    { enabled: isLoggedIn },
  );

  return { relationships, ...result };
};

export { useGroupRelationships };
