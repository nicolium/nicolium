import { Chip } from '@mkljczk/react-native-paper';
import { Link } from '@react-navigation/native';
import { ArrowBendUpLeftIcon } from 'phosphor-react-native/src/icons/ArrowBendUpLeft';
import { AtIcon } from 'phosphor-react-native/src/icons/At';
import { BellSimpleRingingIcon } from 'phosphor-react-native/src/icons/BellSimpleRinging';
import { CalendarDotIcon } from 'phosphor-react-native/src/icons/CalendarDot';
import { CalendarStarIcon } from 'phosphor-react-native/src/icons/CalendarStar';
import { ChartBarIcon } from 'phosphor-react-native/src/icons/ChartBar';
import { ChatsTeardropIcon } from 'phosphor-react-native/src/icons/ChatsTeardrop';
import { PencilSimpleLineIcon } from 'phosphor-react-native/src/icons/PencilSimpleLine';
import { QuotesIcon } from 'phosphor-react-native/src/icons/Quotes';
import { RepeatIcon } from 'phosphor-react-native/src/icons/Repeat';
import { ShapesIcon } from 'phosphor-react-native/src/icons/Shapes';
import { SmileyIcon } from 'phosphor-react-native/src/icons/Smiley';
import { StarIcon } from 'phosphor-react-native/src/icons/Star';
import { SuitcaseIcon } from 'phosphor-react-native/src/icons/Suitcase';
import { ToothIcon } from 'phosphor-react-native/src/icons/Tooth';
import { UserPlusIcon } from 'phosphor-react-native/src/icons/UserPlus';
import React from 'react';
import {
  defineMessages,
  FormattedList,
  FormattedMessage,
  useIntl,
  type IntlShape,
  type MessageDescriptor,
} from 'react-intl';
import { type ColorValue, View } from 'react-native';

import { useInstance } from '@/contexts/current-account-context';
import { useCredentialAccountId } from '@/queries/accounts/use-account-credentials';
import { useNotification } from '@/queries/notifications/use-notifications';

import { Account } from './accounts/account';
import { Status } from './statuses/status';
import { Emoji } from './ui/emoji';
import { Emojify } from './ui/emojify';
import { iconHelper } from './ui/icon';

import type { NotificationType } from '@/utils/notification';
import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import type { NotificationGroup, Account as AccountEntity } from 'pl-api';

const messages: Record<
  NotificationType | 'reply' | 'updateMultiple' | 'quoted_updateMultiple',
  MessageDescriptor
> = defineMessages({
  follow: {
    id: 'notification.follow',
    defaultMessage: '{name} followed you',
  },
  follow_request: {
    id: 'notification.follow_request',
    defaultMessage: '{name} requested to follow you',
  },
  follow_request_accepted: {
    id: 'notification.follow_request_accepted',
    defaultMessage: '{name} accepted your follow request',
  },
  mention: {
    id: 'notification.mention',
    defaultMessage: '{name} mentioned you',
  },
  favourite: {
    id: 'notification.favourite',
    defaultMessage: '{name} liked your post',
  },
  reblog: {
    id: 'notification.reblog',
    defaultMessage: '{name} reposted your post',
  },
  status: {
    id: 'notification.status',
    defaultMessage: '{name} {isReblog, plural, =0 {just posted} other {just reposted}}',
  },
  poll: {
    id: 'notification.poll',
    defaultMessage: 'A poll you have voted in has ended',
  },
  move: {
    id: 'notification.move',
    defaultMessage: '{name} moved to {targetName}',
  },
  chat_mention: {
    id: 'notification.pleroma:chat_mention',
    defaultMessage: '{name} sent you a message',
  },
  emoji_reaction: {
    id: 'notification.pleroma:emoji_reaction',
    defaultMessage: '{name} reacted to your post',
  },
  update: {
    id: 'notification.update',
    defaultMessage: '{name} edited a post you interacted with',
  },
  updateMultiple: {
    id: 'notification.update.multiple',
    defaultMessage:
      '{name} edited a post you interacted with {notificationCount, plural, one {once} other {# times}}',
  },
  event_reminder: {
    id: 'notification.pleroma:event_reminder',
    defaultMessage: 'An event you are participating in starts soon',
  },
  participation_request: {
    id: 'notification.pleroma:participation_request',
    defaultMessage: '{name} wants to join your event',
  },
  participation_accepted: {
    id: 'notification.pleroma:participation_accepted',
    defaultMessage: 'You were accepted to join the event',
  },
  'admin.sign_up': {
    id: 'notification.admin.sign_up',
    defaultMessage: '{name} signed up',
  },
  'admin.report': {
    id: 'notification.admin.report',
    defaultMessage: '{name} reported {target}',
  },
  severed_relationships: {
    id: 'notification.severed_relationships',
    defaultMessage: 'Lost connections with {name}',
  },
  moderation_warning: {
    id: 'notification.moderation_warning',
    defaultMessage: 'You have received a moderation warning',
  },
  bite: {
    id: 'notification.bite',
    defaultMessage: '{name} has bitten {hasStatus, plural, =0 {you} other {your post}}',
  },
  reply: {
    id: 'notification.reply',
    defaultMessage: '{name} replied to your post',
  },
  quote: {
    id: 'notification.quote',
    defaultMessage: '{name} quoted your post',
  },
  quoted_update: {
    id: 'notification.quoted_update',
    defaultMessage: '{name} edited a post you quoted',
  },
  quoted_updateMultiple: {
    id: 'notification.quoted_update.multiple',
    defaultMessage:
      '{name} edited a post you quoted {notificationCount, plural, one {once} other {# times}}',
  },
  subscribed_reaction: {
    id: 'notification.pleroma:subscribed_reaction',
    defaultMessage: '{name} reacted to a post',
  },
  added_to_collection: {
    id: 'notification.added_to_collection',
    defaultMessage: '{name} added you to a collection',
  },
  collection_update: {
    id: 'notification.collection_update',
    defaultMessage: '{name} edited a collection you’re in',
  },
});

const icons: Partial<Record<NotificationType | 'reply', PhosphorIcon>> = {
  follow: UserPlusIcon,
  follow_request: UserPlusIcon,
  follow_request_accepted: UserPlusIcon,
  mention: AtIcon,
  favourite: StarIcon,
  reblog: RepeatIcon,
  status: BellSimpleRingingIcon,
  poll: ChartBarIcon,
  move: SuitcaseIcon,
  chat_mention: ChatsTeardropIcon,
  emoji_reaction: SmileyIcon,
  update: PencilSimpleLineIcon,
  event_reminder: CalendarStarIcon,
  participation_request: CalendarDotIcon,
  participation_accepted: CalendarDotIcon,
  bite: ToothIcon,
  reply: ArrowBendUpLeftIcon,
  quote: QuotesIcon,
  quoted_update: PencilSimpleLineIcon,
  subscribed_reaction: SmileyIcon,
  added_to_collection: ShapesIcon,
  collection_update: ShapesIcon,
};

const buildMessage = (
  intl: IntlShape,
  type: NotificationType | 'reply',
  accounts: Array<Pick<AccountEntity, 'acct' | 'display_name' | 'emojis' | 'id' | 'local' | 'url'>>,
  targetName: string,
  instanceTitle: string,
  hasStatus: boolean,
  isReblog: boolean,
  notificationCount: number,
): React.ReactNode => {
  const renderedAccounts = accounts
    .slice(0, 2)
    .map((account) => (
      <Link
        key={account.id}
        screen='accounts'
        params={{ screen: 'view', params: { id: account.id } }}
      >
        <Emojify text={account.display_name} emojis={account.emojis} />
      </Link>
    ))
    .filter(Boolean);

  if (accounts.length > 2) {
    renderedAccounts.push(
      <FormattedMessage
        key='more'
        id='notification.more'
        defaultMessage='{count, plural, one {# other} other {# others}}'
        values={{ count: accounts.length - renderedAccounts.length }}
      />,
    );
  }

  const message =
    (type === 'update' || type === 'quoted_update') && notificationCount >= 2
      ? messages[type === 'update' ? 'updateMultiple' : 'quoted_updateMultiple']
      : messages[type];

  return intl.formatMessage(message, {
    name: <FormattedList type='conjunction' value={renderedAccounts} />,
    targetName,
    instance: instanceTitle,
    count: accounts.length,
    hasStatus: +hasStatus,
    isReblog: isReblog ? 1 : 0,
    notificationCount,
  });
};

interface INotification {
  notification: NotificationGroup;
}

const Notification: React.FC<INotification> = (props) => {
  const intl = useIntl();
  const instance = useInstance();

  const { data: currentAccountId } = useCredentialAccountId();

  const notification = useNotification(props.notification);
  const status = notification.status;
  const account = notification.accounts[0];

  const displayedType =
    notification.type === 'mention' &&
    (notification.subtype === 'reply' ||
      notification.status?.in_reply_to_account_id === currentAccountId)
      ? 'reply'
      : notification.type;

  const targetName = notification.type === 'move' ? notification.target!.acct : '';

  const message: React.ReactNode = notification.accounts.length
    ? buildMessage(
        intl,
        displayedType,
        notification.accounts,
        targetName,
        instance.title,
        !!status,
        !!status?.reblog_id,
        notification.notifications_count,
      )
    : null;

  const renderContent = () => {
    if (notification.type === 'bite' && status) {
      return (
        <Status id={status.id} withLink compact context='notifications' style={{ padding: 0 }} />
      );
    }

    switch (notification.type) {
      case 'follow':
      case 'follow_request_accepted':
        return <Account id={account.id} withLink withFollowButton />;
      case 'follow_request':
        return <Account id={account.id} withLink actionType='follow_request' />;
      case 'bite':
        return <Account id={account.id} withLink actionType='biting' />;
      case 'move':
        return notification.target ? (
          <Account id={notification.target_id} withLink withFollowButton />
        ) : null;
      case 'added_to_collection':
      case 'collection_update':
        return null;
      // return 'collection' in notification && notification.collection ? (
      //   <CollectionNotification collection={notification.collection} />
      // ) : null;
      case 'favourite':
      case 'mention':
      case 'reblog':
      case 'status':
      case 'poll':
      case 'update':
      case 'emoji_reaction':
      case 'event_reminder':
      case 'participation_accepted':
      case 'participation_request':
      case 'quote':
      case 'quoted_update':
      case 'subscribed_reaction':
        return status ? (
          <Status id={status.id} withLink compact context='notifications' style={{ padding: 0 }} />
        ) : null;
      default:
        return null;
    }
  };

  let icon:
    | ((_: { size: number; allowFontScaling?: boolean; color: ColorValue }) => React.ReactNode)
    | undefined = undefined;

  if (
    notification.type === 'emoji_reaction' ||
    (notification.type === 'subscribed_reaction' && notification.emoji)
  ) {
    icon = () => (
      <Emoji size={18} emoji={notification.emoji!} url={notification.emoji_url || undefined} />
    );
  } else if (icons[displayedType]) {
    icon = iconHelper(icons[displayedType]);
  }

  return (
    <View style={{ padding: 16, gap: 8 }}>
      <View style={{ flexDirection: 'row' }}>
        <Chip
          mode='outlined'
          icon={icon}
          compact
          style={{ flexShrink: 1 }}
          textStyle={{ flexShrink: 1 }}
        >
          {message}
        </Chip>
      </View>
      {renderContent()}
    </View>
  );
};

export { Notification };
