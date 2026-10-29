import { Chip, Text, useTheme } from '@mkljczk/react-native-paper';
import { Link } from '@react-navigation/native';
import { HashIcon } from 'phosphor-react-native/src/icons/Hash';
import { PushPinIcon } from 'phosphor-react-native/src/icons/PushPin';
import { RepeatIcon } from 'phosphor-react-native/src/icons/Repeat';
import React from 'react';
import { FormattedList, FormattedMessage } from 'react-intl';

import { useAccounts } from '@/queries/accounts/use-accounts';
import { useFollowedTags } from '@/queries/hashtags/use-followed-tags';

import { Emojify } from '../ui/emojify';
import { iconHelper } from '../ui/icon';

import type { SelectedStatus } from '@/queries/statuses/use-status';

const StatusPinnedChip: React.FC = () => (
  <Chip mode='outlined' icon={iconHelper(PushPinIcon)} compact>
    <FormattedMessage id='status.pinned' defaultMessage='Pinned post' />
  </Chip>
);

interface IStatusRebloggedChip {
  accountIds: Array<string>;
}

const StatusRebloggedChip: React.FC<IStatusRebloggedChip> = ({ accountIds }) => {
  const { data: accounts } = useAccounts(accountIds);

  if (!accountIds.length) return null;

  return (
    <Chip
      mode='outlined'
      icon={iconHelper(RepeatIcon)}
      compact
      style={{ flexShrink: 1 }}
      textStyle={{ flexShrink: 1 }}
    >
      <FormattedMessage
        id='status.reblogged_by'
        defaultMessage='{name} reposted'
        values={{
          name: (
            <FormattedList
              type='conjunction'
              value={accounts.map((account) => (
                <Link
                  screen='accounts'
                  params={{ screen: 'view', params: { id: account.id } }}
                  key={account.id}
                >
                  <Emojify text={account.display_name} emojis={account.emojis} />
                </Link>
              ))}
            />
          ),
        }}
      />
    </Chip>
  );
};

interface IStatusMaybeFollowedHashtagChip {
  status: SelectedStatus;
}

const StatusMaybeFollowedHashtagChip: React.FC<IStatusMaybeFollowedHashtagChip> = ({ status }) => {
  const { colors } = useTheme();
  const { data: followedTags } = useFollowedTags();

  const filteredTags = status.tags.filter((tag) =>
    followedTags?.some((followed) => followed.name.toLowerCase() === tag.name.toLowerCase()),
  );

  if (!filteredTags.length) {
    return null;
  }

  const tagLinks = filteredTags.slice(0, 2).map((tag) => (
    <Text key={tag.name} style={{ color: colors.primary }}>
      #{tag.name}
    </Text>
  ));

  if (filteredTags.length > 2) {
    tagLinks.push(
      <FormattedMessage
        key='more'
        id='reply_mentions.more'
        defaultMessage='{count} more'
        values={{ count: filteredTags.length - 2 }}
      />,
    );
  }

  return (
    <Chip
      mode='outlined'
      icon={iconHelper(HashIcon)}
      compact
      style={{ flexShrink: 1 }}
      textStyle={{ flexShrink: 1 }}
    >
      <FormattedMessage
        id='status.followed_tag'
        defaultMessage='You’re following {tags}'
        values={{
          tags: <FormattedList type='conjunction' value={tagLinks} />,
        }}
      />
    </Chip>
  );
};

export { StatusPinnedChip, StatusRebloggedChip, StatusMaybeFollowedHashtagChip };
