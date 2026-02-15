import { Entities } from '@/entity-store/entities';
import { useDeleteEntity } from '@/entity-store/hooks/use-delete-entity';
import { useClient } from '@/hooks/use-client';

const useDeleteGroup = () => {
  const client = useClient();

  const { deleteEntity, isSubmitting } = useDeleteEntity(Entities.GROUPS, (groupId: string) =>
    client.experimental.groups.deleteGroup(groupId),
  );

  return {
    mutate: deleteEntity,
    isSubmitting,
  };
};

export { useDeleteGroup };
