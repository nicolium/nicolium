import { DotsThreeVerticalIcon, HashIcon, RepeatIcon } from 'phosphor-react-native';
import React from 'react';
import { FormattedList, FormattedMessage } from 'react-intl';
import { View } from 'react-native';
import { Chip, IconButton, Text, useTheme } from 'react-native-paper';

import { useAccount } from '@/queries/accounts/use-account';
import { useFollowedTags } from '@/queries/hashtags/use-followed-tags';
import { useStatus } from '@/queries/statuses/use-status';

import { Account } from '../accounts/account';
import { iconHelper } from '../ui/icon';
import { UIStatus } from '../ui/status';

import { StatusActions } from './status-actions';

interface IStatusRebloggedChip {
  accountId: string;
}

const StatusRebloggedChip: React.FC<IStatusRebloggedChip> = ({ accountId }) => {
  const { data: account } = useAccount(accountId);

  if (!account) return null;

  return (
    <Chip mode='outlined' icon={iconHelper(RepeatIcon)} compact>
      <FormattedMessage
        id='status.reblogged_by'
        defaultMessage='{name} reposted'
        values={{
          name: account.display_name,
        }}
      />
    </Chip>
  );
};

interface IStatusMaybeFollowedHashtagChip {
  id: string;
}

const StatusMaybeFollowedHashtagChip: React.FC<IStatusMaybeFollowedHashtagChip> = ({ id }) => {
  const { colors } = useTheme();
  const { data: followedTags } = useFollowedTags();
  const { data: status } = useStatus(id);

  if (!status) return null;

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
    <Chip mode='outlined' icon={iconHelper(HashIcon)} compact>
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

interface IStatus {
  id: string;
  context?: 'home' | 'timeline' | 'thread';
  isConnectedBottom?: boolean;
}

const Status: React.FC<IStatus> = ({ id, context, isConnectedBottom }) => {
  const { data: status } = useStatus(id);

  const actualStatus = status?.reblog || status;

  if (!actualStatus) return null;

  let chip;

  if ((context === 'timeline' || context === 'home') && status.reblog) {
    chip = <StatusRebloggedChip accountId={status.account_id!} />;
  } else if (context === 'home') {
    chip = <StatusMaybeFollowedHashtagChip id={status.id} />;
  }

  return (
    <UIStatus
      chip={chip}
      account={
        <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'space-between', flex: 1 }}>
          <Account id={actualStatus.account_id!} timestamp={actualStatus.created_at} />
          <IconButton
            icon={iconHelper(DotsThreeVerticalIcon)}
            onPress={() => {}}
            style={{ height: 32, width: 32 }}
          />
        </View>
      }
      content={actualStatus.content}
      actions={<StatusActions id={id} />}
      isConnectedBottom={isConnectedBottom}
    />
  );
};

export { Status };
