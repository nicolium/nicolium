import { Icon, Tooltip } from '@mkljczk/react-native-paper';
import { AtIcon } from 'phosphor-react-native/src/icons/At';
import { CoinsIcon } from 'phosphor-react-native/src/icons/Coins';
import { GlobeIcon } from 'phosphor-react-native/src/icons/Globe';
import { ListIcon } from 'phosphor-react-native/src/icons/List';
import { LockIcon } from 'phosphor-react-native/src/icons/Lock';
import { MoonIcon } from 'phosphor-react-native/src/icons/Moon';
import { PlanetIcon } from 'phosphor-react-native/src/icons/Planet';
import { UsersThreeIcon } from 'phosphor-react-native/src/icons/UsersThree';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useList } from '@/queries/accounts/use-lists';

import { iconHelper } from '../ui/icon';

import type { SelectedStatus } from '@/queries/statuses/use-status';
import type { Icon as PhosphorIcon } from 'phosphor-react-native';

const messages = defineMessages({
  publicExplanation: {
    id: 'status.visibility.public',
    defaultMessage: 'The post is visible to everyone and appears in public timelines',
  },
  unlistedExplanation: {
    id: 'status.visibility.unlisted',
    defaultMessage: 'The post is visible to everyone, but doesn’t appear in public timelines',
  },
  privateExplanation: {
    id: 'status.visibility.private',
    defaultMessage: 'The post is only visible to followers of the author',
  },
  mutualsOnlyExplanation: {
    id: 'status.visibility.mutuals_only',
    defaultMessage: 'The post is only visible to people who mutually follow the author',
  },
  directExplanation: {
    id: 'status.visibility.direct',
    defaultMessage: 'The post is only visible to mentioned users',
  },
  localExplanation: {
    id: 'status.visibility.local',
    defaultMessage: 'The post is only visible to users on your instance',
  },
  listExplanation: {
    id: 'status.visibility.list',
    defaultMessage: 'The post is only visible to the members of a list',
  },
  listNamedExplanation: {
    id: 'status.visibility.list.named',
    defaultMessage: 'The post is only visible to the members of a {name} list',
  },
  subscribersExplanation: {
    id: 'status.visibility.subscribers',
    defaultMessage: 'The post is only visible to users subscribing to the author',
  },
});

interface IStatusVisibilityIcon {
  status: SelectedStatus;
}

const StatusVisibilityIcon: React.FC<IStatusVisibilityIcon> = ({ status }) => {
  const intl = useIntl();
  const { data: list } = useList(status.list_id?.toString());

  let icon: PhosphorIcon | undefined;
  let title: string | undefined;

  switch (status.visibility) {
    case 'public':
      icon = GlobeIcon;
      title = intl.formatMessage(messages.publicExplanation);
      break;
    case 'unlisted':
      icon = MoonIcon;
      title = intl.formatMessage(messages.unlistedExplanation);
      break;
    case 'private':
      icon = LockIcon;
      title = intl.formatMessage(messages.privateExplanation);
      break;
    case 'mutuals_only':
      icon = UsersThreeIcon;
      title = intl.formatMessage(messages.mutualsOnlyExplanation);
      break;
    case 'direct':
      icon = AtIcon;
      title = intl.formatMessage(messages.directExplanation);
      break;
    case 'local':
      icon = PlanetIcon;
      title = intl.formatMessage(messages.localExplanation);
      break;
    case 'list':
      icon = ListIcon;
      if (list) {
        title = intl.formatMessage(messages.listNamedExplanation, {
          name: list.title,
        });
      } else {
        title = intl.formatMessage(messages.listExplanation);
      }
      break;
    case 'subscribers':
      icon = CoinsIcon;
      title = intl.formatMessage(messages.subscribersExplanation);
      break;
  }

  if (!icon) return null;

  if (!title) return <Icon source={iconHelper(icon)} size={20} />;

  return (
    <Tooltip title={title}>
      {(props) => <Icon source={iconHelper(icon)} size={20} {...props} />}
    </Tooltip>
  );
};

export { StatusVisibilityIcon };
