import React from 'react';

import HStack from '@/components/ui/hstack';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import Emojify from '@/features/emoji/emojify';
import GroupHeaderImage from '@/features/group/components/group-header-image';
import GroupMemberCount from '@/features/group/components/group-member-count';
import GroupPrivacy from '@/features/group/components/group-privacy';
import GroupRelationship from '@/features/group/components/group-relationship';
import { useGroupQuery } from '@/queries/groups/use-group';

import GroupAvatar from './groups/group-avatar';

interface IGroupCard {
  groupId: string;
}

const GroupCard: React.FC<IGroupCard> = ({ groupId }) => {
  const { data: group } = useGroupQuery(groupId, true);

  if (!group) return null;

  return (
    <Stack
      className='relative h-[240px] rounded-lg border border-solid border-gray-300 bg-white black:bg-black dark:border-primary-800 dark:bg-primary-900'
      data-testid='group-card'
    >
      {/* Group Cover Image */}
      <Stack grow className='relative basis-1/2 rounded-t-lg bg-primary-100 dark:bg-gray-800'>
        <GroupHeaderImage
          group={group}
          className='absolute inset-0 size-full rounded-t-lg object-cover'
        />
      </Stack>

      {/* Group Avatar */}
      <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
        <GroupAvatar group={group} size={64} withRing />
      </div>

      {/* Group Info */}
      <Stack alignItems='center' justifyContent='end' grow className='basis-1/2 py-4' space={0.5}>
        <HStack alignItems='center' space={1.5}>
          <Text size='lg' weight='bold'>
            <Emojify text={group.display_name} emojis={group.emojis} />
          </Text>
        </HStack>

        <HStack className='text-gray-700 dark:text-gray-600' space={2} wrap>
          <GroupRelationship group={group} />
          <GroupPrivacy group={group} />
          <GroupMemberCount group={group} />
        </HStack>
      </Stack>
    </Stack>
  );
};

export { GroupCard as default };
