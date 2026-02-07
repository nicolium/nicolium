import { Entities } from '@/entity-store/entities';
import { useCreateEntity } from '@/entity-store/hooks/use-create-entity';
import { useClient } from '@/hooks/use-client';

interface UpdateGroupParams {
  display_name?: string;
  note?: string;
  avatar?: File | '';
  header?: File | '';
  group_visibility?: string;
  discoverable?: boolean;
}

const useUpdateGroup = (groupId: string) => {
  const client = useClient();

  const { createEntity, ...rest } = useCreateEntity(
    [Entities.GROUPS],
    (params: UpdateGroupParams) => client.experimental.groups.updateGroup(groupId, params),
  );

  return {
    updateGroup: createEntity,
    ...rest,
  };
};

export { useUpdateGroup };
