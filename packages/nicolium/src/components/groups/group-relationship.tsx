import iconGavel from '@phosphor-icons/core/regular/gavel.svg';
import iconUsers from '@phosphor-icons/core/regular/users.svg';
import { GroupRoles, type Group } from 'pl-api';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from '@/components/ui/icon';

interface IGroupRelationship {
  group: Pick<Group, 'relationship'>;
}

const GroupRelationship = ({ group }: IGroupRelationship) => {
  const isOwner = group.relationship?.role === GroupRoles.OWNER;
  const isAdmin = group.relationship?.role === GroupRoles.ADMIN;

  if (!isOwner && !isAdmin) {
    return null;
  }

  return (
    <div data-testid='group-relationship' className='group-relationship'>
      <Icon src={isOwner ? iconUsers : iconGavel} />

      <p>
        {isOwner ? (
          <FormattedMessage id='group.role.owner' defaultMessage='Owner' />
        ) : (
          <FormattedMessage id='group.role.admin' defaultMessage='Admin' />
        )}
      </p>
    </div>
  );
};

export { GroupRelationship as default };
