import { Chip, IconButton, Text, TouchableRipple, useTheme } from '@mkljczk/react-native-paper';
import { Link, useNavigation } from '@react-navigation/native';
import { DotsThreeVerticalIcon, HashIcon, RepeatIcon } from 'phosphor-react-native';
import React from 'react';
import { FormattedList, FormattedMessage } from 'react-intl';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useAccount } from '@/queries/accounts/use-account';
import { useFollowedTags } from '@/queries/hashtags/use-followed-tags';
import { useStatus } from '@/queries/statuses/use-status';

import { Account } from '../accounts/account';
import { iconHelper } from '../ui/icon';
import { UIStatus } from '../ui/status';

import { StatusActions } from './status-actions';
import { StatusMedia } from './status-media';

interface IStatusRebloggedChip {
  accountIds: Array<string>;
}

const StatusRebloggedChip: React.FC<IStatusRebloggedChip> = ({ accountIds }) => {
  const { data: account } = useAccount(accountIds[0]);

  if (!account) return null;

  return (
    <View style={{ flexDirection: 'column' }}>
      <Chip mode='outlined' icon={iconHelper(RepeatIcon)} compact style={{ flex: 0 }}>
        <FormattedMessage
          id='status.reblogged_by'
          defaultMessage='{name} reposted'
          values={{
            name: (
              <Link
                screen='accounts'
                params={{ screen: 'view', params: { id: account.id } }}
                key={account.id}
              >
                {account.display_name}
              </Link>
            ),
          }}
        />
      </Chip>
    </View>
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
    <Chip mode='outlined' icon={iconHelper(HashIcon)} compact style={{ flex: 1 }}>
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
  rebloggedBy?: Array<string>;
  context?: 'home' | 'timeline' | 'thread';
  isConnectedBottom?: boolean;
  withLink?: boolean;
  style?: StyleProp<ViewStyle>;
}

const Status: React.FC<IStatus> = ({
  id,
  rebloggedBy,
  context,
  isConnectedBottom,
  withLink,
  style,
}) => {
  const { data: status } = useStatus(id);
  const navigation = useNavigation();

  const actualStatus = status?.reblog || status;

  if (!actualStatus) return null;

  let chip;

  if (rebloggedBy) {
    chip = <StatusRebloggedChip accountIds={rebloggedBy} />;
  } else if ((context === 'timeline' || context === 'home') && status.reblog && status.account_id) {
    chip = <StatusRebloggedChip accountIds={[status.account_id]} />;
  } else if (context === 'home') {
    chip = <StatusMaybeFollowedHashtagChip id={status.id} />;
  }

  const statusBody = (
    <UIStatus
      chip={chip}
      account={
        <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'space-between', flex: 1 }}>
          <Account
            id={actualStatus.account_id!}
            timestamp={actualStatus.created_at}
            style={{ padding: 8, margin: -8 }}
            withLink
          />
          <IconButton
            icon={iconHelper(DotsThreeVerticalIcon)}
            onPress={() => {}}
            style={{ height: 32, width: 32 }}
          />
        </View>
      }
      content={actualStatus.content}
      media={<StatusMedia id={id} />}
      actions={<StatusActions id={id} />}
      isConnectedBottom={isConnectedBottom}
    />
  );

  if (withLink) {
    return (
      <TouchableRipple
        onPress={() => {
          navigation.navigate('status' as never, { screen: 'view', params: { id } } as never);
        }}
        style={{ ...style, padding: 16 }}
      >
        {statusBody}
      </TouchableRipple>
    );
  }

  return <View style={{ ...style, padding: 16 }}>{statusBody}</View>;
};

export { Status };
