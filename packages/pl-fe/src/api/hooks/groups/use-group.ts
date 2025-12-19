import { useLocation, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { Entities } from 'pl-fe/entity-store/entities';
import { useEntity } from 'pl-fe/entity-store/hooks/use-entity';
import { useClient } from 'pl-fe/hooks/use-client';

import { useGroupRelationship } from './use-group-relationship';

import type { Group } from 'pl-api';

const useGroup = (groupId: string, refetch = true) => {
  const client = useClient();
  const location = useLocation();
  const navigate = useNavigate();

  const { entity: group, isUnauthorized, ...result } = useEntity<Group, Group>(
    [Entities.GROUPS, groupId],
    () => client.experimental.groups.getGroup(groupId),
    {
      refetch,
      enabled: !!groupId,
    },
  );
  const { groupRelationship: relationship } = useGroupRelationship(groupId);

  useEffect(() => {
    if (isUnauthorized) {
      localStorage.setItem('plfe:redirect_uri', location.href);
      navigate({ to: '/login', replace: true });
    }
  }, [isUnauthorized]);

  return {
    ...result,
    isUnauthorized,
    group: group ? { ...group, relationship: relationship || null } : undefined,
  };
};

export { useGroup };
