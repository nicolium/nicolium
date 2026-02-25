import { Link, linkOptions, useNavigate, useRouter } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useEffect, useMemo, useRef } from 'react';
import { defineMessages, useIntl, FormattedList, FormattedMessage } from 'react-intl';

import { unfilterStatus } from '@/actions/statuses';
import Card from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import Text from '@/components/ui/text';
import AccountContainer from '@/containers/account-container';
import Emojify from '@/features/emoji/emojify';
import StatusTypeIcon from '@/features/status/components/status-type-icon';
import { Hotkeys } from '@/features/ui/components/hotkeys';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useGroupQuery } from '@/queries/groups/use-group';
import { useFollowedTags } from '@/queries/hashtags/use-followed-tags';
import {
  useFavouriteStatus,
  useReblogStatus,
  useUnfavouriteStatus,
  useUnreblogStatus,
} from '@/queries/statuses/use-status-interactions';
import { makeGetStatus, type SelectedStatus } from '@/selectors';
import { useComposeActions } from '@/stores/compose';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';
import { useStatusMetaActions } from '@/stores/status-meta';
import { textForScreenReader } from '@/utils/status';

import EventPreview from './event-preview';
import HashtagLink from './hashtag-link';
import RelativeTimestamp from './relative-timestamp';
import RssFeedInfo from './rss-feed-info';
import StatusActionBar from './status-action-bar';
import StatusContent from './status-content';
import StatusLanguagePicker from './status-language-picker';
import StatusReactionsBar from './status-reactions-bar';
import StatusReplyMentions from './status-reply-mentions';
import StatusInfo from './statuses/status-info';
import Tombstone from './tombstone';

const messages = defineMessages({
  edited: { id: 'status.edited', defaultMessage: 'Edited {date}' },
  rebloggedBy: { id: 'status.reblogged_by', defaultMessage: '{name} reposted' },
});

interface IAccountInfo {
  status: SelectedStatus;
}

const AccountInfo: React.FC<IAccountInfo> = React.memo(({ status }) => {
  const intl = useIntl();
  return (
    <div className='flex flex-row-reverse items-center gap-1 self-baseline'>
      <Link
        to='/@{$username}/posts/$statusId'
        params={{ username: status.account.acct, statusId: status.id }}
        className='hover:underline'
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <RelativeTimestamp
          timestamp={status.created_at}
          theme='muted'
          size='sm'
          className='whitespace-nowrap'
        />
      </Link>
      <StatusTypeIcon visibility={status.visibility} />
      <StatusLanguagePicker status={status} />
      {!!status.edited_at && (
        <>
          <span className='⁂-separator' />

          <Icon
            className='size-4 text-gray-700 dark:text-gray-600'
            src={require('@phosphor-icons/core/regular/pencil-simple.svg')}
            title={intl.formatMessage(messages.edited, {
              date: intl.formatDate(new Date(status.edited_at), {
                hour12: true,
                month: 'short',
                day: '2-digit',
                hour: 'numeric',
                minute: '2-digit',
              }),
            })}
          />
        </>
      )}
    </div>
  );
});

interface IStatusFollowedTagInfo {
  status: SelectedStatus;
  avatarSize: number;
}

const StatusFollowedTagInfo: React.FC<IStatusFollowedTagInfo> = ({ status, avatarSize }) => {
  const { data: followedTags } = useFollowedTags();

  const filteredTags = status.tags.filter((tag) =>
    followedTags?.some((followed) => followed.name.toLowerCase() === tag.name.toLowerCase()),
  );

  if (!filteredTags.length) {
    return null;
  }

  const tagLinks = filteredTags
    .slice(0, 2)
    .map((tag) => <HashtagLink key={tag.name} hashtag={tag.name} />);

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
    <StatusInfo
      className='-mb-1'
      avatarSize={avatarSize}
      icon={
        <Icon
          src={require('@phosphor-icons/core/regular/hash.svg')}
          className='size-4 text-primary-600 dark:text-primary-400'
          aria-hidden
        />
      }
      text={
        <FormattedMessage
          id='status.followed_tag'
          defaultMessage='You’re following {tags}'
          values={{
            tags: <FormattedList type='conjunction' value={tagLinks} />,
          }}
        />
      }
    />
  );
};

interface IStatus {
  id?: string;
  avatarSize?: number;
  status: SelectedStatus;
  onClick?: () => void;
  muted?: boolean;
  unread?: boolean;
  onMoveUp?: (statusId: string, featured?: boolean) => void;
  onMoveDown?: (statusId: string, featured?: boolean) => void;
  focusable?: boolean;
  featured?: boolean;
  hideActionBar?: boolean;
  hoverable?: boolean;
  variant?: 'default' | 'rounded' | 'slim';
  showGroup?: boolean;
  showInfo?: boolean;
  fromBookmarks?: boolean;
  fromHomeTimeline?: boolean;
  className?: string;
}

const Status: React.FC<IStatus> = (props) => {
  const {
    status,
    avatarSize = 42,
    focusable = true,
    hoverable = true,
    onClick,
    onMoveUp,
    onMoveDown,
    muted,
    featured,
    unread,
    hideActionBar,
    variant = 'rounded',
    showGroup = true,
    showInfo = true,
    fromBookmarks = false,
    fromHomeTimeline = false,
    className,
  } = props;

  const intl = useIntl();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { toggleStatusesMediaHidden } = useStatusMetaActions();
  const { openModal } = useModalsActions();
  const { replyCompose, mentionCompose } = useComposeActions();
  const { boostModal } = useSettings();
  const didShowCard = useRef(false);
  const node = useRef<HTMLDivElement>(null);

  const getStatus = useMemo(makeGetStatus, []);
  const actualStatus = useAppSelector(
    (state) => (status.reblog_id && getStatus(state, { id: status.reblog_id })!) || status,
  );

  const { data: group } = useGroupQuery(actualStatus.group_id ?? undefined);

  const { mutate: favouriteStatus } = useFavouriteStatus(actualStatus.id);
  const { mutate: unfavouriteStatus } = useUnfavouriteStatus(actualStatus.id);
  const { mutate: reblogStatus } = useReblogStatus(actualStatus.id);
  const { mutate: unreblogStatus } = useUnreblogStatus(actualStatus.id);

  const isReblog = status.reblog_id;

  const filterResults = useMemo(() => {
    return [...status.filtered, ...actualStatus.filtered]
      .filter(({ filter }) => filter.filter_action === 'warn')
      .reduce(
        (uniqueFilters, current) => {
          if (
            !uniqueFilters.some(({ filter: uniqueFilter }) => uniqueFilter.id === current.filter.id)
          ) {
            uniqueFilters.push(current);
          }
          return uniqueFilters;
        },
        [] as typeof status.filtered,
      );
  }, [status.filtered, actualStatus.filtered]);
  const filtered = filterResults.length > 0;

  // Track height changes we know about to compensate scrolling.
  useEffect(() => {
    didShowCard.current = Boolean(!muted && status?.card);
  }, []);

  const handleClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();

    // If the user is selecting text, don't focus the status.
    if (getSelection()?.toString().length) {
      return;
    }

    const link = linkOptions({
      to: '/@{$username}/posts/$statusId',
      params: { username: actualStatus.account.acct, statusId: actualStatus.id },
    });

    if (!e || !(e.ctrlKey || e.metaKey)) {
      if (onClick) {
        onClick();
      } else {
        navigate(link);
      }
    } else {
      const url = router.buildLocation(link).href;
      window.open(url, '_blank');
    }
  };

  const handleHotkeyOpenMedia = (e?: KeyboardEvent) => {
    const status = actualStatus;

    e?.preventDefault();

    if (status.media_attachments.length > 0) {
      openModal('MEDIA', { statusId: status.id, media: status.media_attachments, index: 0 });
    }
  };

  const handleHotkeyReply = (e?: KeyboardEvent) => {
    if (status.rss_feed) return;

    e?.preventDefault();
    replyCompose(actualStatus, status.reblog_id ? status.account : undefined);
  };

  const handleHotkeyFavourite = (e?: KeyboardEvent) => {
    if (status.rss_feed) return;

    e?.preventDefault();
    if (status.favourited) unfavouriteStatus();
    else favouriteStatus();
  };

  const handleHotkeyBoost = (e?: KeyboardEvent) => {
    if (status.rss_feed) return;

    const modalReblog = () => {
      if (status.reblogged) unreblogStatus();
      else reblogStatus(undefined);
    };
    if ((e && e.shiftKey) || !boostModal) {
      modalReblog();
    } else {
      openModal('BOOST', { statusId: actualStatus.id, onReblog: modalReblog });
    }
  };

  const handleHotkeyMention = (e?: KeyboardEvent) => {
    if (status.rss_feed) return;

    e?.preventDefault();
    mentionCompose(actualStatus.account);
  };

  const handleHotkeyOpen = () => {
    navigate({
      to: '/@{$username}/posts/$statusId',
      params: { username: actualStatus.account.acct, statusId: actualStatus.id },
    });
  };

  const handleHotkeyOpenProfile = () => {
    navigate({ to: '/@{$username}', params: { username: actualStatus.account.acct } });
  };

  const handleHotkeyMoveUp = (e?: KeyboardEvent) => {
    if (onMoveUp) {
      onMoveUp(status.id, featured);
    }
  };

  const handleHotkeyMoveDown = (e?: KeyboardEvent) => {
    if (onMoveDown) {
      onMoveDown(status.id, featured);
    }
  };

  const handleHotkeyToggleSensitive = () => {
    toggleStatusesMediaHidden([actualStatus.id]);
  };

  const handleHotkeyReact = () => {
    if (status.rss_feed) return;

    (node.current?.querySelector('.emoji-picker-dropdown') as HTMLButtonElement)?.click();
  };

  const handleUnfilter = () => {
    dispatch(unfilterStatus(actualStatus.id));
    if (actualStatus.id !== status.id) dispatch(unfilterStatus(status.id));
  };

  const statusInfo = useMemo(() => {
    if (!showInfo) return null;

    if (isReblog && showGroup && group) {
      return (
        <StatusInfo
          className='-mb-1'
          avatarSize={avatarSize}
          icon={
            <Icon
              src={require('@phosphor-icons/core/regular/repeat.svg')}
              className='size-4 text-green-600'
              aria-hidden
            />
          }
          text={
            <FormattedMessage
              id='status.reblogged_by_with_group'
              defaultMessage='{name} reposted from {group}'
              values={{
                name: (
                  <Link
                    to='/@{$username}'
                    params={{ username: status.account.acct }}
                    className='hover:underline'
                  >
                    <bdi className='truncate'>
                      <strong className='text-gray-800 dark:text-gray-200'>
                        <Emojify
                          text={status.account.display_name}
                          emojis={status.account.emojis}
                        />
                      </strong>
                    </bdi>
                  </Link>
                ),
                group: (
                  <Link
                    to='/groups/$groupId'
                    params={{ groupId: group.id }}
                    className='hover:underline'
                  >
                    <strong className='text-gray-800 dark:text-gray-200'>
                      <Emojify text={group.display_name} emojis={group.emojis} />
                    </strong>
                  </Link>
                ),
              }}
            />
          }
        />
      );
    } else if (isReblog) {
      const accounts = status.accounts ?? [status.account];

      const renderedAccounts = accounts.slice(0, 2).map(
        (account) =>
          !!account && (
            <Link
              key={account.acct}
              to='/@{$username}'
              params={{ username: account.acct }}
              className='hover:underline'
            >
              <bdi className='truncate'>
                <strong className='text-gray-800 dark:text-gray-200'>
                  <Emojify text={account.display_name} emojis={account.emojis} />
                </strong>
              </bdi>
            </Link>
          ),
      );

      if (accounts.length > 2) {
        renderedAccounts.push(
          <FormattedMessage
            id='notification.more'
            defaultMessage='{count, plural, one {# other} other {# others}}'
            values={{ count: accounts.length - renderedAccounts.length }}
          />,
        );
      }

      const values = {
        name: <FormattedList type='conjunction' value={renderedAccounts} />,
        count: accounts.length,
      };

      return (
        <StatusInfo
          className='-mb-1'
          avatarSize={avatarSize}
          icon={
            <Icon
              src={require('@phosphor-icons/core/regular/repeat.svg')}
              className='size-4 text-green-600'
              aria-hidden
            />
          }
          text={
            status.visibility === 'private' ? (
              <FormattedMessage
                id='status.reblogged_by_private'
                defaultMessage='{name} reposted to followers'
                values={values}
              />
            ) : (
              <FormattedMessage
                id='status.reblogged_by'
                defaultMessage='{name} reposted'
                values={values}
              />
            )
          }
        />
      );
    } else if (featured) {
      return (
        <StatusInfo
          className='-mb-1'
          avatarSize={avatarSize}
          icon={
            <Icon
              src={require('@phosphor-icons/core/regular/push-pin.svg')}
              className='size-4 text-gray-600 dark:text-gray-400'
              aria-hidden
            />
          }
          text={<FormattedMessage id='status.pinned' defaultMessage='Pinned post' />}
        />
      );
    } else if (showGroup && group) {
      return (
        <StatusInfo
          className='-mb-1'
          avatarSize={avatarSize}
          icon={
            <Icon
              src={require('@phosphor-icons/core/regular/users-three.svg')}
              className='size-4 text-primary-600 dark:text-primary-400'
              aria-hidden
            />
          }
          text={
            <FormattedMessage
              id='status.group'
              defaultMessage='Posted in {group}'
              values={{
                group: (
                  <Link
                    to='/groups/$groupId'
                    params={{ groupId: group.id }}
                    className='hover:underline'
                  >
                    <bdi className='truncate'>
                      <strong className='text-gray-800 dark:text-gray-200'>
                        <Emojify text={group.display_name} emojis={group.emojis} />
                      </strong>
                    </bdi>
                  </Link>
                ),
              }}
            />
          }
        />
      );
    } else if (fromHomeTimeline) {
      return <StatusFollowedTagInfo status={actualStatus} avatarSize={avatarSize} />;
    }
  }, [status.accounts, group?.id]);

  if (!status) return null;

  if (status.deleted)
    return <Tombstone id={status.id} onMoveUp={onMoveUp} onMoveDown={onMoveDown} deleted />;

  if (filtered && actualStatus.showFiltered !== true) {
    const body = (
      <div className={clsx('status__wrapper text-center')} ref={node}>
        <Text theme='muted'>
          <FormattedMessage id='status.filtered' defaultMessage='Filtered' />:{' '}
          {filterResults.map(({ filter }) => filter.title).join(', ')}.{' '}
          <button
            className='text-primary-600 hover:underline dark:text-primary-400'
            onClick={handleUnfilter}
          >
            <FormattedMessage id='status.show_filter_reason' defaultMessage='Show anyway' />
          </button>
        </Text>
      </div>
    );

    if (muted) return body;

    const minHandlers = {
      moveUp: handleHotkeyMoveUp,
      moveDown: handleHotkeyMoveDown,
    };

    return (
      <Hotkeys handlers={minHandlers} focusable={focusable} element='article'>
        {body}
      </Hotkeys>
    );
  }

  let rebloggedByText;
  if (status.reblog_id === 'object') {
    rebloggedByText = intl.formatMessage(messages.rebloggedBy, { name: status.account.acct });
  }

  const body = (
    <div
      className={clsx('⁂-status', {
        '⁂-status--reply': !!status.in_reply_to_id,
      })}
      data-featured={featured ? 'true' : null}
      data-visibility={actualStatus.visibility}
      data-id={status.id}
      aria-label={textForScreenReader(intl, actualStatus, rebloggedByText)}
      ref={node}
      onClick={handleClick}
      role='link'
    >
      <Card
        variant={variant}
        className={clsx('⁂-status__wrapper status-wrapper', className, {
          'py-6 sm:p-5': variant === 'rounded',
          muted,
          read: unread === false,
        })}
      >
        {statusInfo}

        {status.rss_feed ? (
          <RssFeedInfo feed={status.rss_feed} timestamp={status.created_at} />
        ) : (
          actualStatus.account_id && (
            <div className='flex'>
              <AccountContainer
                key={actualStatus.account_id}
                id={actualStatus.account_id}
                action={<AccountInfo status={actualStatus} />}
                showAccountHoverCard={hoverable}
                withLinkToProfile={hoverable}
                approvalStatus={actualStatus.approval_status}
                avatarSize={avatarSize}
                actionAlignment='top'
              />
            </div>
          )
        )}

        <div className='status__content-wrapper'>
          <StatusReplyMentions status={actualStatus} hoverable={hoverable} />

          {actualStatus.event ? (
            <EventPreview className='shadow-xl' status={actualStatus} />
          ) : (
            <StatusContent
              status={actualStatus}
              onClick={handleClick}
              collapsable
              translatable
              withMedia
            />
          )}

          {!status.rss_feed && (
            <>
              <StatusReactionsBar status={actualStatus} collapsed />

              {!hideActionBar && (
                <div
                  className={clsx({
                    'pt-2': actualStatus.emoji_reactions.length,
                    'pt-4': !actualStatus.emoji_reactions.length,
                  })}
                >
                  <StatusActionBar
                    status={actualStatus}
                    rebloggedBy={isReblog ? status.account : undefined}
                    fromBookmarks={fromBookmarks}
                    expandable
                  />
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );

  if (muted) return body;

  const handlers = {
    reply: handleHotkeyReply,
    favourite: handleHotkeyFavourite,
    boost: handleHotkeyBoost,
    mention: handleHotkeyMention,
    open: handleHotkeyOpen,
    openProfile: handleHotkeyOpenProfile,
    moveUp: handleHotkeyMoveUp,
    moveDown: handleHotkeyMoveDown,
    toggleSensitive: handleHotkeyToggleSensitive,
    openMedia: handleHotkeyOpenMedia,
    react: handleHotkeyReact,
  };

  return (
    <Hotkeys handlers={handlers} focusable={focusable} element='article' data-testid='status'>
      {body}
    </Hotkeys>
  );
};

export { type IStatus, Status as default };
