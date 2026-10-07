import {
  ActivityIndicator,
  Card,
  Chip,
  Icon,
  IconButton,
  Text,
  TouchableRipple,
  useTheme,
} from '@mkljczk/react-native-paper';
import { Link, useNavigation } from '@react-navigation/native';
import {
  DotsThreeIcon,
  DotsThreeVerticalIcon,
  HashIcon,
  PaperclipIcon,
  QuotesIcon,
  RepeatIcon,
} from 'phosphor-react-native';
import React from 'react';
import { FormattedList, FormattedMessage } from 'react-intl';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';

import { useAccount } from '@/queries/accounts/use-account';
import { useFollowedTags } from '@/queries/hashtags/use-followed-tags';
import { type SelectedStatus, useStatus } from '@/queries/statuses/use-status';
import { useStatusMeta, useStatusMetaActions } from '@/stores/status-meta';

import { Account } from '../accounts/account';
import { iconHelper } from '../ui/icon';
import { UIStatus } from '../ui/status';

import { StatusActions } from './status-actions';
import { StatusMedia } from './status-media';

interface IQuote {
  id: string;
}

const Quote: React.FC<IQuote> = ({ id }) => {
  const { isPending, isError } = useStatus(id);

  return (
    <Card mode='outlined'>
      {isPending ? (
        <ActivityIndicator style={{ margin: 8 }} />
      ) : isError ? (
        <Text>
          <FormattedMessage id='statuses.quote_tombstone' defaultMessage='Post is unavailable.' />
        </Text>
      ) : (
        <Status id={id} withLink withActions={false} compact />
      )}
    </Card>
  );
};

interface IStatusRebloggedChip {
  accountIds: Array<string>;
}

const StatusRebloggedChip: React.FC<IStatusRebloggedChip> = ({ accountIds }) => {
  const { data: account } = useAccount(accountIds[0]);

  if (!account) return null;

  return (
    <Chip mode='outlined' icon={iconHelper(RepeatIcon)} compact>
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

interface IStatusReplyMentions {
  status: SelectedStatus;
}

const StatusReplyMentions: React.FC<IStatusReplyMentions> = ({ status }) => {
  if (!status.in_reply_to_id) {
    // Used as placeholder by Akkoma
    // https://akkoma.dev/AkkomaGang/akkoma/src/branch/develop/lib/pleroma/web/mastodon_api/views/status_view.ex#L31
    if (status.in_reply_to_account_id === '_') {
      return (
        <Text variant='labelLarge'>
          <FormattedMessage id='reply_mentions.reply_empty' defaultMessage='Replying to post' />
        </Text>
      );
    }
    return null;
  }

  const to = status.mentions;

  // The post is a reply, but it has no mentions.
  // Rare, but it can happen.
  if (to.length === 0) {
    return (
      <Text
        variant='labelLarge'
        style={{ textDecorationLine: status.parent_visible === false ? 'line-through' : undefined }}
      >
        <FormattedMessage id='reply_mentions.reply_empty' defaultMessage='Replying to post' />
      </Text>
    );
  }

  // The typical case with a reply-to and a list of mentions.
  const accounts = to.slice(0, 2).map((account, index, array) => (
    <>
      <Link
        screen='accounts'
        params={{ screen: 'view', params: { id: account.id } }}
        key={account.id}
      >
        @{account.username}
      </Link>
      {index !== array.length - 1 && <>, </>}
    </>
  ));

  if (to.length > 2) {
    accounts.push(
      <>
        {', '}
        <Link screen='status' params={{ screen: 'mentions', params: { id } }} key='more'>
          <FormattedMessage
            id='reply_mentions.more'
            defaultMessage='{count} more'
            values={{ count: to.length - 2 }}
          />
        </Link>
      </>,
    );
  }

  return (
    <Text variant='labelLarge'>
      <FormattedMessage
        id='reply_mentions.reply'
        defaultMessage='Replying to {accounts}'
        values={{
          accounts,
        }}
      />
    </Text>
  );
};

interface IStatus {
  id: string;
  rebloggedBy?: Array<string>;
  context?: 'home' | 'timeline' | 'thread';
  isConnectedBottom?: boolean | ((status: SelectedStatus) => boolean);
  withLink?: boolean;
  withActions?: boolean;
  style?: StyleProp<ViewStyle>;
  detailed?: boolean;
  compact?: boolean;
  textOnly?: boolean;
}

const Status: React.FC<IStatus> = ({
  id,
  rebloggedBy,
  context,
  isConnectedBottom,
  withLink,
  withActions = true,
  style,
  ...props
}) => {
  const { data: status } = useStatus(id);
  const navigation = useNavigation();

  const { spoilerExpanded } = useStatusMeta(id);
  const { expandStatusSpoiler, collapseStatusSpoiler } = useStatusMetaActions();

  const actualStatus = status?.reblog || status;

  if (!actualStatus) return null;

  let chip;

  if (rebloggedBy) {
    chip = <StatusRebloggedChip accountIds={rebloggedBy} />;
  } else if ((context === 'timeline' || context === 'home') && status.reblog && status.account_id) {
    chip = <StatusRebloggedChip accountIds={[status.account_id]} />;
  } else if (context === 'home') {
    chip = <StatusMaybeFollowedHashtagChip status={actualStatus} />;
  }

  const statusBody = (
    <UIStatus
      chip={chip}
      account={
        <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'space-between' }}>
          <Account
            id={actualStatus.account_id!}
            timestamp={actualStatus.created_at}
            style={{ padding: 8, margin: -8 }}
            withLink
            fullWidthPressable={false}
          />
          {withActions && (
            <IconButton
              icon={iconHelper(Platform.OS === 'ios' ? DotsThreeIcon : DotsThreeVerticalIcon)}
              onPress={() => {}}
              style={{ height: 32, width: 32 }}
            />
          )}
        </View>
      }
      displayedMentions={<StatusReplyMentions status={actualStatus} />}
      content={actualStatus.content}
      emojis={actualStatus.emojis}
      mentions={actualStatus.mentions}
      spoilerText={actualStatus.spoiler_text}
      media={
        props.textOnly ? (
          <>
            {status.media_attachments.length > 0 && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Icon source={iconHelper(PaperclipIcon)} size={20} />
                <Text>
                  <FormattedMessage
                    id='status.attachment_count'
                    defaultMessage='{count, plural, one {# attachment} other {# attachments}}'
                    values={{ count: status.media_attachments.length }}
                  />
                </Text>
              </View>
            )}
            {status.quote_id && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Icon source={iconHelper(QuotesIcon)} size={20} />
                <Text>
                  <FormattedMessage id='status.quote_indicator' defaultMessage='Quoted post' />
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            <StatusMedia status={status} compact={props.compact} />
            {actualStatus.quote_id &&
              (props.compact ? (
                <Card mode='outlined'>
                  <Card.Content style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Icon source={iconHelper(QuotesIcon)} size={20} />
                    <Text>
                      <FormattedMessage id='status.quote_indicator' defaultMessage='Quoted post' />
                    </Text>
                  </Card.Content>
                </Card>
              ) : (
                <Quote id={actualStatus.quote_id} />
              ))}
          </>
        )
      }
      actions={withActions ? <StatusActions status={status} /> : undefined}
      isConnectedBottom={
        typeof isConnectedBottom === 'function'
          ? isConnectedBottom(actualStatus)
          : isConnectedBottom
      }
      spoilerExpanded={spoilerExpanded}
      expandStatusSpoiler={() => expandStatusSpoiler(id)}
      collapseStatusSpoiler={() => collapseStatusSpoiler(id)}
      {...props}
    />
  );

  if (withLink) {
    return (
      <TouchableRipple
        onPress={() => {
          navigation.navigate('status', { screen: 'view', params: { id } });
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
