import { Entities } from '@/entity-store/entities';
import { useCreateEntity } from '@/entity-store/hooks/use-create-entity';
import { useClient } from '@/hooks/use-client';

import { useGroups } from './use-groups';

import type { Group } from 'pl-api';

const useLeaveGroup = (group: Pick<Group, 'id'>) => {
  const client = useClient();
  const { invalidate } = useGroups();

  const { createEntity, isSubmitting } = useCreateEntity(
    [Entities.GROUP_RELATIONSHIPS, group.id],
    () => client.experimental.groups.leaveGroup(group.id),
  );

  return {
    mutate: createEntity,
    isSubmitting,
    invalidate,
  };
};

export { useLeaveGroup };
