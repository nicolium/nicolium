import React from 'react';

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
    <div
      className='relative flex h-[240px] flex-col rounded-lg border border-solid border-gray-300 bg-white black:bg-black dark:border-primary-800 dark:bg-primary-900'
      data-testid='group-card'
    >
      {/* Group Cover Image */}
      <div className='relative flex grow basis-1/2 flex-col rounded-t-lg bg-primary-100 dark:bg-gray-800'>
        <GroupHeaderImage
          group={group}
          className='absolute inset-0 size-full rounded-t-lg object-cover'
        />
      </div>

      {/* Group Avatar */}
      <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
        <GroupAvatar group={group} size={64} withRing />
      </div>

      {/* Group Info */}
      <div className='flex grow basis-1/2 flex-col items-center justify-end gap-0.5 py-4'>
        <div className='flex items-center gap-1.5'>
          <Text size='lg' weight='bold'>
            <Emojify text={group.display_name} emojis={group.emojis} />
          </Text>
        </div>

        <div className='flex flex-wrap gap-2 text-gray-700 dark:text-gray-600'>
          <GroupRelationship group={group} />
          <GroupPrivacy group={group} />
          <GroupMemberCount group={group} />
        </div>
      </div>
    </div>
  );
};

export { GroupCard as default };
