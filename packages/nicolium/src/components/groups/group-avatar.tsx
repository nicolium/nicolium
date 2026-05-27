import clsx from 'clsx';
import { GroupRoles, type Group } from 'pl-api';
import React from 'react';

import Avatar from '@/components/ui/avatar';

interface IGroupAvatar {
  group: Pick<Group, 'avatar' | 'avatar_description' | 'relationship'>;
  size: number;
  withRing?: boolean;
}

const GroupAvatar: React.FC<IGroupAvatar> = ({ group, size, withRing = false }) => {
  const isOwner = group.relationship?.role === GroupRoles.OWNER;

  return (
    <Avatar
      className={clsx('group-avatar', {
        'group-avatar--owner-ring': isOwner && withRing,

        'group-avatar--owner': isOwner && !withRing,
        'group-avatar--ring': !isOwner && withRing,
      })}
      src={group.avatar}
      alt={group.avatar_description}
      size={size}
    />
  );
};

export { GroupAvatar as default };
