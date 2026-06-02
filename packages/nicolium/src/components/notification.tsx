import iconArrowBendUpLeft from '@phosphor-icons/core/regular/arrow-bend-up-left.svg';
import iconAt from '@phosphor-icons/core/regular/at.svg';
import iconBellSimpleRinging from '@phosphor-icons/core/regular/bell-simple-ringing.svg';
import iconCalendarDot from '@phosphor-icons/core/regular/calendar-dot.svg';
import iconCalendarStar from '@phosphor-icons/core/regular/calendar-star.svg';
import iconChartBar from '@phosphor-icons/core/regular/chart-bar.svg';
import iconChatsTeardrop from '@phosphor-icons/core/regular/chats-teardrop.svg';
import iconPencilSimpleLine from '@phosphor-icons/core/regular/pencil-simple-line.svg';
import iconQuotes from '@phosphor-icons/core/regular/quotes.svg';
import iconRepeat from '@phosphor-icons/core/regular/repeat.svg';
import iconRocketLaunch from '@phosphor-icons/core/regular/rocket-launch.svg';
import iconSmiley from '@phosphor-icons/core/regular/smiley.svg';
import iconStar from '@phosphor-icons/core/regular/star.svg';
import iconSuitcase from '@phosphor-icons/core/regular/suitcase.svg';
import iconTooth from '@phosphor-icons/core/regular/tooth.svg';
import iconUserPlus from '@phosphor-icons/core/regular/user-plus.svg';
import { Link, useNavigate } from '@tanstack/react-router';
import React, { useCallback, useMemo, useRef } from 'react';
import {
  defineMessages,
  useIntl,
  FormattedList,
  FormattedMessage,
  type IntlShape,
  type MessageDescriptor,
} from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import HoverAccountWrapper from '@/components/accounts/hover-account-wrapper';
import Markup from '@/components/markup';
import AttachmentThumbs from '@/components/media/attachment-thumbs';
import RelativeTimestamp from '@/components/relative-timestamp';
import { ParsedContent } from '@/components/statuses/parsed-content';
import StatusContainer from '@/components/statuses/status-container';
import StatusInfo from '@/components/statuses/status-info';
import Emoji from '@/components/ui/emoji';
import Icon from '@/components/ui/icon';
import Emojify from '@/features/emoji/emojify';
import { Hotkeys } from '@/features/ui/components/hotkeys';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useNotification } from '@/queries/notifications/use-notifications';
import {
  useFavouriteStatus,
  useUnfavouriteStatus,
  useReblogStatus,
  useUnreblogStatus,
} from '@/queries/statuses/use-status-interactions';
import { useComposeActions } from '@/stores/compose';
import { useInstance } from '@/stores/instance';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';
import { useStatusMetaActions } from '@/stores/status-meta';

import { AccountLink } from './accounts/account-link';

import type { NormalizedStatus as StatusEntity } from '@/queries/statuses/normalize';
import type { NotificationType } from '@/utils/notification';
import type { Account, NotificationGroup } from 'pl-api';

const notificationForScreenReader = (intl: IntlShape, message: string, timestamp: string) => {
  const output = [message];

  output.push(
    intl.formatDate(timestamp, {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    }),
  );

  return output.join(', ');
};

const buildLink = (
  account: Pick<Account, 'acct' | 'display_name' | 'emojis' | 'id' | 'local' | 'url'>,
): React.JSX.Element => (
  <AccountLink
    className='font-bold text-gray-800 hover:underline dark:text-gray-200'
    title={account.acct}
    account={account}
    key={account.id}
  >
    <HoverAccountWrapper key={account.acct} element='bdi' accountId={account.id}>
      <Emojify text={account.display_name} emojis={account.emojis} />
    </HoverAccountWrapper>
  </AccountLink>
);

const icons: Partial<Record<NotificationType | 'reply', string>> = {
  follow: iconUserPlus,
  follow_request: iconUserPlus,
  follow_request_accepted: iconUserPlus,
  mention: iconAt,
  favourite: iconStar,
  reblog: iconRepeat,
  status: iconBellSimpleRinging,
  poll: iconChartBar,
  move: iconSuitcase,
  chat_mention: iconChatsTeardrop,
  emoji_reaction: iconSmiley,
  update: iconPencilSimpleLine,
  event_reminder: iconCalendarStar,
  participation_request: iconCalendarDot,
  participation_accepted: iconCalendarDot,
  bite: iconTooth,
  reply: iconArrowBendUpLeft,
  quote: iconQuotes,
  quoted_update: iconPencilSimpleLine,
};

// For use by the service worker
defineMessages({
  group: {
    id: 'notifications.group',
    defaultMessage: '{count, plural, one {# notification} other {# notifications}}',
  },
  showMore: { id: 'status.show_more', defaultMessage: 'Show more' },
});

const messages: Record<NotificationType | 'reply', MessageDescriptor> = defineMessages({
  follow: {
    id: 'notification.follow',
    defaultMessage: '{name} followed you',
  },
  follow_request: {
    id: 'notification.follow_request',
    defaultMessage: '{name} has requested to follow you',
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
});

const buildMessage = (
  intl: IntlShape,
  type: NotificationType | 'reply',
  accounts: Array<Pick<Account, 'acct' | 'display_name' | 'emojis' | 'id' | 'local' | 'url'>>,
  targetName: string,
  instanceTitle: string,
  hasStatus: boolean,
  isReblog: boolean,
): React.ReactNode => {
  const renderedAccounts = accounts
    .slice(0, 2)
    .map((account) => buildLink(account))
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

  return intl.formatMessage(messages[type], {
    name: <FormattedList type='conjunction' value={renderedAccounts} />,
    targetName,
    instance: instanceTitle,
    count: accounts.length,
    hasStatus: +hasStatus,
    isReblog: isReblog ? 1 : 0,
  });
};

const avatarSize = 48;

interface IStatusPreview {
  status: StatusEntity;
}

const StatusPreview: React.FC<IStatusPreview> = ({ status }) => {
  const output: Array<React.ReactNode> = [];

  if (status.content) {
    output.push(
      <Markup
        truncate
        className='line-clamp-2 inline text-ellipsis [&_br]:hidden [&_p:first-child]:inline [&_p:first-child]:truncate [&_p]:hidden'
        size='sm'
        tag='div'
      >
        <ParsedContent
          key='content'
          html={status.content}
          mentions={status.mentions}
          hasQuote={!!status.quote_id}
          emojis={status.emojis}
        />
      </Markup>,
    );
  }

  if (status.media_attachments.length) {
    output.push(<AttachmentThumbs key='attachments' status={status} />);
  }

  return output;
};

interface INotification {
  notification: NotificationGroup;
  onMoveUp?: (notificationId: string) => void;
  onMoveDown?: (notificationId: string) => void;
  compact?: boolean;
}

const STATUS_NOTIFICATION_TYPES: readonly NotificationType[] = [
  'mention',
  'status',
  'reblog',
  'favourite',
  'poll',
  'update',
  'emoji_reaction',
  'event_reminder',
  'participation_accepted',
  'participation_request',
  'bite',
  'quote',
  'quoted_update',
] as const;

const getNotificationStatusId = (notification: NotificationGroup): string | null => {
  if (STATUS_NOTIFICATION_TYPES.includes(notification.type))
    // @ts-expect-error
    return notification.status_id;
  return null;
};

const Notification: React.FC<INotification> = ({ onMoveUp, onMoveDown, compact, ...props }) => {
  const { mentionCompose, replyCompose } = useComposeActions();

  const { me } = useLoggedIn();
  const { toggleStatusesMediaHidden } = useStatusMetaActions();
  const { openModal } = useModalsActions();
  const settings = useSettings();

  const node = useRef<HTMLDivElement>(null);

  const notification = useNotification(props.notification);
  const status = notification.status;

  const { mutate: favouriteStatus } = useFavouriteStatus(status?.id!);
  const { mutate: unfavouriteStatus } = useUnfavouriteStatus(status?.id!);
  const { mutate: reblogStatus } = useReblogStatus(status?.id!);
  const { mutate: unreblogStatus } = useUnreblogStatus(status?.id!);

  const navigate = useNavigate();
  const intl = useIntl();
  const instance = useInstance();

  const type = notification.type;
  const account = notification.accounts[0];

  const handleOpen = () => {
    if (status && typeof status === 'object' && account && typeof account === 'object') {
      navigate({
        to: '/@{$username}/posts/$statusId',
        params: { username: account.acct, statusId: status.id },
      });
    } else {
      handleOpenProfile();
    }
  };

  const handleOpenProfile = () => {
    if (account && typeof account === 'object') {
      navigate({ to: '/@{$username}', params: { username: account.acct } });
    }
  };

  const handleMention = useCallback(
    (e?: KeyboardEvent) => {
      e?.preventDefault();

      mentionCompose(account);
    },
    [account],
  );

  const handleReply = useCallback(
    (e?: KeyboardEvent) => {
      e?.preventDefault();

      if (status) {
        replyCompose(status, account);
      } else {
        mentionCompose(account);
      }
    },
    [account],
  );

  const handleHotkeyFavourite = useCallback(() => {
    if (status && typeof status === 'object') {
      if (status.favourited) {
        unfavouriteStatus();
      } else {
        favouriteStatus();
      }
    }
  }, [status]);

  const handleHotkeyBoost = useCallback(
    (e?: KeyboardEvent) => {
      if (status && typeof status === 'object') {
        const boostModal = settings.boostModal;
        if (status.reblogged) {
          unreblogStatus();
        } else if (e?.shiftKey || !boostModal) {
          reblogStatus({});
        } else {
          openModal('BOOST', {
            statusId: status.id,
            onReblog: (visibility, scheduledAt) => {
              reblogStatus({ visibility, scheduledAt });
            },
          });
        }
      }
    },
    [status],
  );

  const handleHotkeyToggleSensitive = useCallback(() => {
    if (status && typeof status === 'object') {
      toggleStatusesMediaHidden([status.id]);
    }
  }, [status]);

  const handleMoveUp = () => {
    if (onMoveUp) {
      onMoveUp(notification.group_key);
    }
  };

  const handleMoveDown = () => {
    if (onMoveDown) {
      onMoveDown(notification.group_key);
    }
  };

  const handlers = {
    reply: handleReply,
    favourite: handleHotkeyFavourite,
    boost: handleHotkeyBoost,
    mention: handleMention,
    open: handleOpen,
    openProfile: handleOpenProfile,
    moveUp: handleMoveUp,
    moveDown: handleMoveDown,
    toggleSensitive: handleHotkeyToggleSensitive,
  };

  const displayedType =
    notification.type === 'mention' &&
    (notification.subtype === 'reply' || status?.in_reply_to_account_id === me)
      ? 'reply'
      : notification.type;

  const icon = useMemo(() => {
    if (type === 'emoji_reaction' && notification.emoji) {
      return (
        <Emoji
          emoji={notification.emoji}
          src={notification.emoji_url ?? undefined}
          className='notification__icon notification__icon--emoji'
        />
      );
    } else if (icons[displayedType]) {
      let icon = icons[displayedType];
      if (displayedType === 'reblog' && settings.useRocketIconForReblogs) {
        icon = iconRocketLaunch;
      }
      return <Icon src={icon} className='notification__icon' aria-hidden />;
    } else {
      return null;
    }
  }, [type, 'emoji' in notification && notification.emoji]);

  const renderContent = () => {
    if (type === 'bite' && status) {
      return compact ? (
        <StatusPreview status={status} />
      ) : (
        <StatusContainer
          id={status.id}
          onMoveDown={handleMoveDown}
          onMoveUp={handleMoveUp}
          avatarSize={avatarSize}
          contextType='notifications'
          showGroup={false}
          showInfo={false}
          variant='slim'
        />
      );
    }

    switch (type) {
      case 'follow':
      case 'follow_request_accepted':
        return <AccountContainer id={account.id} avatarSize={avatarSize} withRelationship />;
      case 'follow_request':
        return (
          <AccountContainer
            id={account.id}
            avatarSize={avatarSize}
            actionType='follow_request'
            withRelationship
          />
        );
      case 'bite':
        return (
          <AccountContainer
            id={account.id}
            avatarSize={avatarSize}
            actionType='biting'
            withRelationship
          />
        );
      case 'move':
        return notification.target ? (
          <AccountContainer id={notification.target_id} avatarSize={avatarSize} withRelationship />
        ) : null;
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
        return status ? (
          compact ? (
            <StatusPreview status={status} />
          ) : (
            <StatusContainer
              id={status.id}
              onMoveDown={handleMoveDown}
              onMoveUp={handleMoveUp}
              avatarSize={avatarSize}
              contextType='notifications'
              showGroup={false}
              showInfo={false}
              variant='slim'
            />
          )
        ) : null;
      default:
        return null;
    }
  };

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
      )
    : null;

  const ariaLabel = notificationForScreenReader(
    intl,
    intl.formatMessage(messages[displayedType], {
      name: notification.accounts.length
        ? intl.formatList(
            notification.accounts.map((account) => account.acct),
            { type: 'conjunction' },
          )
        : '',
      targetName,
      isReblog: status?.reblog_id ? 1 : 0,
    }),
    notification.latest_page_notification_at!,
  );

  const statusInfo = (
    <StatusInfo
      avatarSize={compact ? 0 : avatarSize}
      icon={icon}
      text={message}
      title={ariaLabel}
    />
  );

  const timestamp = (
    <RelativeTimestamp
      timestamp={notification.latest_page_notification_at!}
      theme='muted'
      size='sm'
    />
  );

  return (
    <Hotkeys handlers={handlers} data-testid='notification'>
      <div className='notification' tabIndex={0} aria-label={ariaLabel} ref={node}>
        {compact || !['mention', 'status'].includes(notification.type) ? (
          <div className='notification__header'>
            <div className='notification__info'>{statusInfo}</div>

            {compact && status ? (
              <Link
                to='/@{$username}/posts/$statusId'
                params={{ username: status.account?.acct || 'undefined', statusId: status.id }}
                className='notification__timestamp'
              >
                {timestamp}
              </Link>
            ) : (
              <p className='notification__timestamp'>{timestamp}</p>
            )}
          </div>
        ) : (
          statusInfo
        )}

        {renderContent()}
      </div>
    </Hotkeys>
  );
};

export {
  Notification as default,
  buildLink,
  getNotificationStatusId,
  messages as notificationMessages,
};
