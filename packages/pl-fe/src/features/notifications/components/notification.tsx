import React, { useCallback, useMemo, useRef } from 'react';
import { defineMessages, useIntl, FormattedList, FormattedMessage, IntlShape, MessageDescriptor } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';

import { mentionCompose, replyCompose } from 'pl-fe/actions/compose';
import AttachmentThumbs from 'pl-fe/components/attachment-thumbs';
import HoverAccountWrapper from 'pl-fe/components/hover-account-wrapper';
import Icon from 'pl-fe/components/icon';
import Markup from 'pl-fe/components/markup';
import { ParsedContent } from 'pl-fe/components/parsed-content';
import RelativeTimestamp from 'pl-fe/components/relative-timestamp';
import StatusInfo from 'pl-fe/components/statuses/status-info';
import Emoji from 'pl-fe/components/ui/emoji';
import AccountContainer from 'pl-fe/containers/account-container';
import StatusContainer from 'pl-fe/containers/status-container';
import Emojify from 'pl-fe/features/emoji/emojify';
import { Hotkeys } from 'pl-fe/features/ui/components/hotkeys';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';
import { useFavouriteStatus, useUnfavouriteStatus, useReblogStatus, useUnreblogStatus } from 'pl-fe/queries/statuses/use-status-interactions';
import { makeGetNotification, makeGetStatus } from 'pl-fe/selectors';
import { useModalsActions } from 'pl-fe/stores/modals';
import { useSettings } from 'pl-fe/stores/settings';
import { useStatusMetaActions } from 'pl-fe/stores/status-meta';
import { NotificationType } from 'pl-fe/utils/notification';

import type { Account, NotificationGroup } from 'pl-api';
import type { Status as StatusEntity } from 'pl-fe/normalizers/status';

const notificationForScreenReader = (intl: IntlShape, message: string, timestamp: string) => {
  const output = [message];

  output.push(intl.formatDate(timestamp, { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }));

  return output.join(', ');
};

const buildLink = (account: Pick<Account, 'acct' | 'display_name' | 'emojis' | 'id'>): JSX.Element => (
  <Link
    className='font-bold text-gray-800 hover:underline dark:text-gray-200'
    title={account.acct}
    to={`/@${account.acct}`}
    key={account.id}
  >
    <HoverAccountWrapper key={account.acct} element='bdi' accountId={account.id}>
      <Emojify text={account.display_name} emojis={account.emojis} />
    </HoverAccountWrapper>
  </Link>
);

const icons: Partial<Record<NotificationType | 'reply', string>> = {
  follow: require('@phosphor-icons/core/regular/user-plus.svg'),
  follow_request: require('@phosphor-icons/core/regular/user-plus.svg'),
  mention: require('@phosphor-icons/core/regular/at.svg'),
  favourite: require('@phosphor-icons/core/regular/star.svg'),
  reblog: require('@phosphor-icons/core/regular/repeat.svg'),
  status: require('@phosphor-icons/core/regular/bell-simple-ringing.svg'),
  poll: require('@phosphor-icons/core/regular/chart-bar.svg'),
  move: require('@phosphor-icons/core/regular/suitcase.svg'),
  chat_mention: require('@phosphor-icons/core/regular/chats-teardrop.svg'),
  emoji_reaction: require('@phosphor-icons/core/regular/smiley.svg'),
  update: require('@phosphor-icons/core/regular/pencil-simple-line.svg'),
  event_reminder: require('@phosphor-icons/core/regular/calendar-star.svg'),
  participation_request: require('@phosphor-icons/core/regular/calendar-dot.svg'),
  participation_accepted: require('@phosphor-icons/core/regular/calendar-dot.svg'),
  bite: require('@phosphor-icons/core/regular/tooth.svg'),
  reply: require('@phosphor-icons/core/regular/arrow-bend-up-left.svg'),
  quote: require('@phosphor-icons/core/regular/quotes.svg'),
  quoted_update: require('@phosphor-icons/core/regular/pencil-simple-line.svg'),
};

const messages: Record<NotificationType | 'reply', MessageDescriptor> = defineMessages({
  follow: {
    id: 'notification.follow',
    defaultMessage: '{name} followed you',
  },
  follow_request: {
    id: 'notification.follow_request',
    defaultMessage: '{name} has requested to follow you',
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
    defaultMessage: '{name} just posted',
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
    defaultMessage: '{name} has bit {hasStatus, plural, =0 {you} other {your status}}',
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
  accounts: Array<Pick<Account, 'acct' | 'display_name' | 'emojis' | 'id'>>,
  targetName: string,
  instanceTitle: string,
  hasStatus: boolean,
): React.ReactNode => {
  const renderedAccounts = accounts.slice(0, 2).map(account => buildLink(account)).filter(Boolean);

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
      >
        <ParsedContent key='content' html={status.content} mentions={status.mentions} hasQuote={!!status.quote_id} emojis={status.emojis} />
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

const getNotificationStatus = (n: Pick<NotificationGroup, 'type'> & ({ status: StatusEntity } | { })): StatusEntity | null => {
  if (['mention', 'status', 'reblog', 'favourite', 'poll', 'update', 'emoji_reaction', 'event_reminder', 'participation_accepted', 'participation_request', 'bite', 'quote', 'quoted_update'].includes(n.type))
    // @ts-ignore
    return n.status;
  return null;
};

const Notification: React.FC<INotification> = (props) => {
  const { onMoveUp, onMoveDown, compact } = props;

  const dispatch = useAppDispatch();

  const getNotification = useCallback(makeGetNotification(), []);

  const { me } = useLoggedIn();
  const { toggleStatusesMediaHidden } = useStatusMetaActions();
  const { openModal } = useModalsActions();
  const settings = useSettings();

  const node = useRef<HTMLDivElement>(null);

  const notification = useAppSelector((state) => getNotification(state, props.notification));
  const status = getNotificationStatus(notification);

  const { mutate: favouriteStatus } = useFavouriteStatus(status?.id!);
  const { mutate: unfavouriteStatus } = useUnfavouriteStatus(status?.id!);
  const { mutate: reblogStatus } = useReblogStatus(status?.id!);
  const { mutate: unreblogStatus } = useUnreblogStatus(status?.id!);

  const history = useHistory();
  const intl = useIntl();
  const instance = useInstance();

  const type = notification.type;
  const { accounts } = notification;
  const account = accounts[0];

  const handleOpen = () => {
    if (status && typeof status === 'object' && account && typeof account === 'object') {
      history.push(`/@${account.acct}/posts/${status.id}`);
    } else {
      handleOpenProfile();
    }
  };

  const handleOpenProfile = () => {
    if (account && typeof account === 'object') {
      history.push(`/@${account.acct}`);
    }
  };

  const handleMention = useCallback((e?: KeyboardEvent) => {
    e?.preventDefault();

    dispatch(mentionCompose(account));
  }, [account]);

  const handleReply = useCallback((e?: KeyboardEvent) => {
    e?.preventDefault();

    if (status) {
      dispatch(replyCompose(status, account));
    } else {
      dispatch(mentionCompose(account));
    }
  }, [account]);

  const handleHotkeyFavourite = useCallback((e?: KeyboardEvent) => {
    if (status && typeof status === 'object') {
      if (status.favourited) {
        unfavouriteStatus();
      } else {
        favouriteStatus();
      }
    }
  }, [status]);

  const handleHotkeyBoost = useCallback((e?: KeyboardEvent) => {
    if (status && typeof status === 'object') {
      const boostModal = settings.boostModal;
      if (status.reblogged) {
        unreblogStatus();
      } else {
        if (e?.shiftKey || !boostModal) {
          reblogStatus(undefined);
        } else {
          openModal('BOOST', {
            statusId: status.id,
            onReblog: () => {
              reblogStatus(undefined);
            },
          });
        }
      }
    }
  }, [status]);

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

  const displayedType = notification.type === 'mention' && (notification.subtype === 'reply' || status?.in_reply_to_account_id === me) ? 'reply' : notification.type;

  const renderIcon = (): React.ReactNode => {
    if (type === 'emoji_reaction' && notification.emoji) {
      return (
        <Emoji
          emoji={notification.emoji}
          src={notification.emoji_url || undefined}
          className='⁂-notification__icon ⁂-notification__icon--emoji'
        />
      );
    } else if (icons[displayedType]) {
      return (
        <Icon
          src={icons[displayedType]!}
          className='⁂-notification__icon'
        />
      );
    } else {
      return null;
    }
  };

  const renderContent = () => {
    if (type === 'bite' && status) {
      return compact ? <StatusPreview status={status} /> : (
        <StatusContainer
          id={status.id}
          onMoveDown={handleMoveDown}
          onMoveUp={handleMoveUp}
          avatarSize={avatarSize}
          contextType='notifications'
          showGroup={false}
          variant='slim'
        />
      );
    }

    switch (type) {
      case 'follow':
        return (
          <AccountContainer
            id={account.id}
            avatarSize={avatarSize}
            withRelationship
          />
        );
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
          <AccountContainer
            id={notification.target_id}
            avatarSize={avatarSize}
            withRelationship
          />
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
          compact ? <StatusPreview status={status} /> : (
            <StatusContainer
              id={status.id}
              onMoveDown={handleMoveDown}
              onMoveUp={handleMoveUp}
              avatarSize={avatarSize}
              contextType='notifications'
              showGroup={false}
              variant='slim'
            />
          )) : null;
      default:
        return null;
    }
  };

  const targetName = notification.type === 'move' ? notification.target.acct : '';

  const message: React.ReactNode = accounts.length
    ? buildMessage(intl, displayedType, accounts, targetName, instance.title, !!status)
    : null;

  const ariaLabel = (
    notificationForScreenReader(
      intl,
      intl.formatMessage(messages[displayedType], {
        name: accounts.length ? intl.formatList(accounts.map(account => account.acct), { type: 'conjunction' }) : '',
        targetName,
      }),
      notification.latest_page_notification_at!,
    )
  );

  const statusInfo = <StatusInfo avatarSize={compact ? 0 : avatarSize} icon={renderIcon()} text={message} title={ariaLabel} />;

  return (
    <Hotkeys handlers={handlers} data-testid='notification'>
      <div
        className='⁂-notification'
        tabIndex={0}
        aria-label={ariaLabel}
        ref={node}
      >
        {compact || !['mention', 'status'].includes(notification.type) ? (
          <div className='⁂-notification__header'>
            <div className='⁂-notification__info'>
              {statusInfo}
            </div>

            <p className='⁂-notification__timestamp'>
              <RelativeTimestamp timestamp={notification.latest_page_notification_at!} theme='muted' size='sm' className='whitespace-nowrap' />
            </p>
          </div>
        ) : statusInfo}

        {renderContent()}
      </div>
    </Hotkeys>
  );
};

export { Notification as default, buildLink, getNotificationStatus };
