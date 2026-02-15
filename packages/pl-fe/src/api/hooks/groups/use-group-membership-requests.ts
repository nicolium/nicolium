import { GroupRoles } from 'pl-api';

import { Entities } from '@/entity-store/entities';
import { useDismissEntity } from '@/entity-store/hooks/use-dismiss-entity';
import { useEntities } from '@/entity-store/hooks/use-entities';
import { useClient } from '@/hooks/use-client';

import { useGroupRelationship } from './use-group-relationship';

import type { ExpandedEntitiesPath } from '@/entity-store/hooks/types';
import type { Account } from 'pl-api';

const useGroupMembershipRequests = (groupId: string) => {
  const client = useClient();
  const path: ExpandedEntitiesPath = [Entities.ACCOUNTS, 'membership_requests', groupId];

  const { groupRelationship: relationship } = useGroupRelationship(groupId);

  const { entities, invalidate, fetchEntities, ...rest } = useEntities<Account>(
    path,
    () => client.experimental.groups.getGroupMembershipRequests(groupId),
    {
      enabled: relationship?.role === GroupRoles.OWNER || relationship?.role === GroupRoles.ADMIN,
    },
  );

  const { dismissEntity: authorize } = useDismissEntity(path, async (accountId: string) => {
    const response = await client.experimental.groups.acceptGroupMembershipRequest(
      groupId,
      accountId,
    );
    invalidate();
    return response;
  });

  const { dismissEntity: reject } = useDismissEntity(path, async (accountId: string) => {
    const response = await client.experimental.groups.rejectGroupMembershipRequest(
      groupId,
      accountId,
    );
    invalidate();
    return response;
  });

  return {
    accounts: entities,
    refetch: fetchEntities,
    authorize,
    reject,
    ...rest,
  };
};

export { useGroupMembershipRequests };
