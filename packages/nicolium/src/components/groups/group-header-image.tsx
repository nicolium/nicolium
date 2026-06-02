import iconImageSquare from '@phosphor-icons/core/regular/image-square.svg';
import clsx from 'clsx';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Icon from '@/components/ui/icon';

import type { Group } from 'pl-api';

const messages = defineMessages({
  header: { id: 'group.header.alt', defaultMessage: 'Group header' },
});

interface IGroupHeaderImage {
  group?: Group | false | null;
  className?: string;
}

const GroupHeaderImage: React.FC<IGroupHeaderImage> = ({ className, group }) => {
  const intl = useIntl();

  const [isHeaderMissing, setIsHeaderMissing] = useState<boolean>(false);

  if (!group || !group.header) {
    return null;
  }

  if (isHeaderMissing) {
    return (
      <div className={clsx(className, 'group-header-image group-header-image--missing')}>
        <Icon src={iconImageSquare} className='group-header-image__missing-icon' />
      </div>
    );
  }

  return (
    <img
      className={className}
      src={group.header}
      alt={group.header_description || intl.formatMessage(messages.header)}
      onError={() => {
        setIsHeaderMissing(true);
      }}
    />
  );
};

export { GroupHeaderImage as default };
