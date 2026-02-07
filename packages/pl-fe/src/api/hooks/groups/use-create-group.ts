import { Entities } from '@/entity-store/entities';
import { useCreateEntity } from '@/entity-store/hooks/use-create-entity';
import { useClient } from '@/hooks/use-client';

import type { Group, CreateGroupParams } from 'pl-api';

const useCreateGroup = () => {
  const client = useClient();

  const { createEntity, ...rest } = useCreateEntity<Group, Group, CreateGroupParams>(
    [Entities.GROUPS, 'search', ''],
    (params: CreateGroupParams) => client.experimental.groups.createGroup(params),
  );

  return {
    createGroup: createEntity,
    ...rest,
  };
};

export { useCreateGroup };
