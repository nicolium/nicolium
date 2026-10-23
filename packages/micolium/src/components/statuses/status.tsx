import {
  ActivityIndicator,
  Card,
  Chip,
  Icon,
  IconButton,
  Text,
  Tooltip,
  TouchableRipple,
  useTheme,
} from '@mkljczk/react-native-paper';
import { Link, useNavigation } from '@react-navigation/native';
import { AtIcon } from 'phosphor-react-native/src/icons/At';
import { CoinsIcon } from 'phosphor-react-native/src/icons/Coins';
import { EyeSlashIcon } from 'phosphor-react-native/src/icons/EyeSlash';
import { GlobeIcon } from 'phosphor-react-native/src/icons/Globe';
import { HashIcon } from 'phosphor-react-native/src/icons/Hash';
import { ListIcon } from 'phosphor-react-native/src/icons/List';
import { LockIcon } from 'phosphor-react-native/src/icons/Lock';
import { MoonIcon } from 'phosphor-react-native/src/icons/Moon';
import { PaperclipIcon } from 'phosphor-react-native/src/icons/Paperclip';
import { PlanetIcon } from 'phosphor-react-native/src/icons/Planet';
import { PushPinIcon } from 'phosphor-react-native/src/icons/PushPin';
import { QuotesIcon } from 'phosphor-react-native/src/icons/Quotes';
import { RepeatIcon } from 'phosphor-react-native/src/icons/Repeat';
import { UsersThreeIcon } from 'phosphor-react-native/src/icons/UsersThree';
import React from 'react';
import {
  defineMessages,
  FormattedDate,
  FormattedList,
  FormattedMessage,
  useIntl,
} from 'react-intl';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useAccounts } from '@/queries/accounts/use-accounts';
import { useList } from '@/queries/accounts/use-lists';
import { useFollowedTags } from '@/queries/hashtags/use-followed-tags';
import { type SelectedStatus, useStatus } from '@/queries/statuses/use-status';
import { useStatusMeta, useStatusMetaActions } from '@/stores/status-meta';

import { Account } from '../accounts/account';
import { Emojify } from '../ui/emojify';
import { iconHelper } from '../ui/icon';
import { UIStatus } from '../ui/status';

import { StatusActions } from './status-actions';
import { StatusActionsDropdown } from './status-actions-dropdown';
import { StatusEmojiReactions } from './status-emoji-reactions';
import { StatusLinkPreview } from './status-link-preview';
import { StatusMedia } from './status-media';
import { StatusPoll } from './status-poll';

import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import type { FilterContext, FilterResult } from 'pl-api';

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

interface IQuote {
  id: string;
  context?: FilterContext;
}

const Quote: React.FC<IQuote> = ({ id, ...props }) => {
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
        <Status id={id} withLink withActions={false} compact {...props} />
      )}
    </Card>
  );
};

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
    <Chip mode='outlined' icon={iconHelper(RepeatIcon)} compact>
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
  const accounts = to.slice(0, 2).map((account) => (
    <Link
      screen='accounts'
      params={{ screen: 'view', params: { id: account.id } }}
      key={account.id}
    >
      @{account.username}
    </Link>
  ));

  if (to.length > 2) {
    accounts.push(
      <Link screen='status' params={{ screen: 'mentions', params: { id: status.id } }} key='more'>
        <FormattedMessage
          id='reply_mentions.more'
          defaultMessage='{count} more'
          values={{ count: to.length - 2 }}
        />
      </Link>,
    );
  }

  return (
    <Text variant='labelLarge'>
      <FormattedMessage
        id='reply_mentions.reply'
        defaultMessage='Replying to {accounts}'
        values={{
          accounts: <FormattedList type='conjunction' value={accounts} />,
        }}
      />
    </Text>
  );
};

interface IStatusDetailedInfo {
  status: SelectedStatus;
}

const StatusDetailedInfo: React.FC<IStatusDetailedInfo> = ({ status }) => {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
      <Text variant='bodyMedium' style={{ color: colors.onSurfaceVariant }}>
        <FormattedDate
          value={new Date(status.created_at)}
          hour12
          year='numeric'
          month='short'
          day='2-digit'
          hour='numeric'
          minute='2-digit'
        />
      </Text>
      {status.edited_at && (
        <>
          <Text variant='bodyMedium' style={{ color: colors.onSurfaceVariant }}>
            ·
          </Text>
          <Link screen='status' params={{ screen: 'history', params: { id: status.id } }}>
            <Text variant='bodyMedium' style={{ color: colors.primary }}>
              <FormattedMessage
                id='status.edited'
                defaultMessage='Edited {date}'
                values={{
                  date: (
                    <FormattedDate
                      value={new Date(status.edited_at)}
                      hour12
                      month='short'
                      day='2-digit'
                      hour='numeric'
                      minute='2-digit'
                    />
                  ),
                }}
              />
            </Text>
          </Link>
        </>
      )}
    </View>
  );
};

interface IStatus {
  id: string;
  rebloggedBy?: Array<string>;
  showPinned?: boolean;
  context?: FilterContext;
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
  showPinned,
  context,
  isConnectedBottom,
  withLink,
  withActions = true,
  style,
  ...props
}) => {
  const { data: status } = useStatus(id, { withFilteredResults: true });
  const navigation = useNavigation();

  const { spoilerExpanded, showFiltered } = useStatusMeta(id);
  const { expandStatusSpoiler, collapseStatusSpoiler, unfilterStatus, undoUnfilterStatus } =
    useStatusMetaActions();

  const actualStatus = status?.reblog || status;

  const [hideFilters, warnFilters, blurFilters] = React.useMemo(() => {
    if (!context || !actualStatus) return [[], [], []];

    const hideResults: Array<FilterResult> = [];
    const warnResults: Array<FilterResult> = [];
    const blurResults: Array<FilterResult> = [];

    actualStatus.filtered
      .reduce<Array<FilterResult>>((uniqueFilters, current) => {
        if (
          !uniqueFilters.some(({ filter: uniqueFilter }) => uniqueFilter.id === current.filter.id)
        ) {
          uniqueFilters.push(current);
        }
        return uniqueFilters;
      }, [])
      .forEach((filter) => {
        if (filter.filter.filter_action === 'hide') hideResults.push(filter);
        if (filter.filter.filter_action === 'warn') warnResults.push(filter);
        if (filter.filter.filter_action === 'blur') blurResults.push(filter);
      });

    return [hideResults, warnResults, blurResults];
  }, [actualStatus?.filtered, context]);

  if (!actualStatus || (hideFilters.length && !props.detailed)) return null;

  let chip;

  if (showPinned) {
    chip = <StatusPinnedChip />;
  } else if (rebloggedBy?.length) {
    chip = <StatusRebloggedChip accountIds={rebloggedBy} />;
  } else if (
    (context === 'public' || context === 'home') &&
    actualStatus.reblog &&
    actualStatus.account_id
  ) {
    chip = <StatusRebloggedChip accountIds={[actualStatus.account_id]} />;
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
            timestamp={props.detailed ? undefined : actualStatus.created_at}
            style={{ padding: 8, margin: -8 }}
            withLink
            fullWidthPressable={false}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {showFiltered && warnFilters.length > 0 && (
              <IconButton
                icon={iconHelper(EyeSlashIcon)}
                style={{ height: 32, width: 32 }}
                onPress={() => undoUnfilterStatus(actualStatus.id)}
              />
            )}
            <StatusVisibilityIcon status={status} />
            {withActions && <StatusActionsDropdown status={status} />}
          </View>
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
            {actualStatus.media_attachments.length > 0 && (
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
                    values={{ count: actualStatus.media_attachments.length }}
                  />
                </Text>
              </View>
            )}
            {actualStatus.quote_id && (
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
            <StatusMedia status={actualStatus} compact={props.compact} />
            {actualStatus.poll_id && <StatusPoll status={actualStatus} />}
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
                <Quote id={actualStatus.quote_id} context={context} />
              ))}
            {!props.compact && <StatusLinkPreview status={actualStatus} />}
            {props.detailed && <StatusDetailedInfo status={actualStatus} />}
          </>
        )
      }
      actions={
        withActions ? (
          <>
            <StatusEmojiReactions status={actualStatus} />
            <StatusActions status={actualStatus} />
          </>
        ) : undefined
      }
      isConnectedBottom={
        typeof isConnectedBottom === 'function'
          ? isConnectedBottom(actualStatus)
          : isConnectedBottom
      }
      spoilerExpanded={spoilerExpanded}
      expandStatusSpoiler={() => expandStatusSpoiler(id)}
      collapseStatusSpoiler={() => collapseStatusSpoiler(id)}
      filters={warnFilters}
      showFiltered={showFiltered}
      unfilterStatus={() => unfilterStatus(id)}
      {...props}
    />
  );

  if (withLink) {
    return (
      <TouchableRipple
        onPress={() => {
          navigation.navigate('status', { screen: 'view', params: { id } });
        }}
        style={{ padding: 16, ...style }}
      >
        {statusBody}
      </TouchableRipple>
    );
  }

  return <View style={{ padding: 16, ...style }}>{statusBody}</View>;
};

export { Status };
