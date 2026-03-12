import { GroupRoles, type Group } from 'pl-api';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from '@/components/ui/icon';
import Text from '@/components/ui/text';

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
    <div
      data-testid='group-relationship'
      className='flex items-center gap-1 text-primary-600 dark:text-primary-400'
    >
      <Icon
        className='size-4'
        src={
          isOwner
            ? require('@phosphor-icons/core/regular/users.svg')
            : require('@phosphor-icons/core/regular/gavel.svg')
        }
      />

      <Text tag='span' weight='medium' size='sm' theme='inherit'>
        {isOwner ? (
          <FormattedMessage id='group.role.owner' defaultMessage='Owner' />
        ) : (
          <FormattedMessage id='group.role.admin' defaultMessage='Admin' />
        )}
      </Text>
    </div>
  );
};

export { GroupRelationship as default };
