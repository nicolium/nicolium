import React from 'react';

import Emojify from '@/features/emoji/emojify';
import { useGroupQuery } from '@/queries/groups/use-group';

import GroupAvatar from './group-avatar';
import GroupHeaderImage from './group-header-image';
import GroupMemberCount from './group-member-count';
import GroupPrivacy from './group-privacy';
import GroupRelationship from './group-relationship';

interface IGroupCard {
  groupId: string;
}

const GroupCard: React.FC<IGroupCard> = ({ groupId }) => {
  const { data: group } = useGroupQuery(groupId, true);

  if (!group) return null;

  return (
    <div className='group-card group-card--framed' data-testid='group-card'>
      {/* Group Cover Image */}
      <div className='group-card__cover'>
        <GroupHeaderImage group={group} className='group-card__cover-image' />
      </div>

      {/* Group Avatar */}
      <div className='group-card__avatar'>
        <GroupAvatar group={group} size={64} withRing />
      </div>

      {/* Group Info */}
      <div className='group-card__info'>
        <p className='group-card__name'>
          <Emojify text={group.display_name} emojis={group.emojis} />
        </p>

        <div className='group-card__meta'>
          <GroupRelationship group={group} />
          <GroupPrivacy group={group} />
          <GroupMemberCount group={group} />
        </div>
      </div>
    </div>
  );
};

export { GroupCard as default };
