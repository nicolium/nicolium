import * as v from 'valibot';

import { Entities } from '@/entity-store/entities';
import { useCreateEntity } from '@/entity-store/hooks/use-create-entity';
import { useClient } from '@/hooks/use-client';

import type { Group, GroupMember, GroupRole } from 'pl-api';

const usePromoteGroupMember = (group: Pick<Group, 'id'>, groupMember: Pick<GroupMember, 'id'>) => {
  const client = useClient();

  const { createEntity } = useCreateEntity(
    [Entities.GROUP_MEMBERSHIPS, groupMember.id],
    ({ account_ids, role }: { account_ids: string[]; role: GroupRole }) => client.experimental.groups.promoteGroupUsers(group.id, account_ids, role),
    { schema: v.pipe(v.any(), v.transform(arr => arr[0])) },
  );

  return createEntity;
};

export { usePromoteGroupMember };
