import React from 'react';
import { defineMessages, MessageDescriptor, useIntl } from 'react-intl';

import Icon from 'pl-fe/components/ui/icon';
import Text from 'pl-fe/components/ui/text';

import type { Status } from 'pl-fe/normalizers/status';

interface IStatusTypeIcon {
  visibility: Status['visibility'];
}

const messages: Record<string, MessageDescriptor> = defineMessages({
  direct: { id: 'status.visibility.direct', defaultMessage: 'The post is only visible to mentioned users' },
  private: { id: 'status.visibility.private', defaultMessage: 'The post is only visible to followers of the author' },
  mutuals_only: { id: 'status.visibility.mutuals_only', defaultMessage: 'The post is only visible to people who mutually follow the author' },
  local: { id: 'status.visibility.local', defaultMessage: 'The post is only visible to users on your instance' },
  list: { id: 'status.visibility.list', defaultMessage: 'The post is only visible to the members of a list' },
  list_named: { id: 'status.visibility.list.named', defaultMessage: 'The post is only visible to the members of a {name} list' },
  subscribers: { id: 'status.visibility.subscribers', defaultMessage: 'The post is only visible to users subscribing the author' },
});

const STATUS_TYPE_ICONS: Record<string, string> = {
  direct: require('@phosphor-icons/core/regular/envelope-simple.svg'),
  private: require('@phosphor-icons/core/regular/lock.svg'),
  mutuals_only: require('@phosphor-icons/core/regular/users-three.svg'),
  local: require('@phosphor-icons/core/regular/planet.svg'),
  list: require('@phosphor-icons/core/regular/list-bullets.svg'),
  subscribers: require('@phosphor-icons/core/regular/coins.svg'),
};

const StatusTypeIcon: React.FC<IStatusTypeIcon> = React.memo(({ visibility }) => {
  const intl = useIntl();

  const icon = STATUS_TYPE_ICONS[visibility];
  const message = messages[visibility];

  if (!icon) return null;

  return (
    <>
      <Text tag='span' theme='muted' size='sm'>&middot;</Text>

      <Icon title={message ? intl.formatMessage(message) : undefined} className='size-4 text-gray-700 dark:text-gray-600' src={icon} />
    </>
  );
});

export { StatusTypeIcon as default };
