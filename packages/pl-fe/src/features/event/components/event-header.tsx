import { Link, useNavigate } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { fetchEventIcs } from '@/actions/events';
import { deleteStatusModal, toggleStatusSensitivityModal } from '@/actions/moderation';
import { initReport, ReportableEntities } from '@/actions/reports';
import { deleteStatus } from '@/actions/statuses';
import DropdownMenu, { type Menu as MenuType } from '@/components/dropdown-menu';
import Icon from '@/components/icon';
import StillImage from '@/components/still-image';
import Button from '@/components/ui/button';
import HStack from '@/components/ui/hstack';
import IconButton from '@/components/ui/icon-button';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import VerificationBadge from '@/components/verification-badge';
import Emojify from '@/features/emoji/emojify';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useAccount } from '@/queries/accounts/use-account';
import { useChats } from '@/queries/chats';
import {
  useBookmarkStatus,
  usePinStatus,
  useReblogStatus,
  useUnbookmarkStatus,
  useUnpinStatus,
  useUnreblogStatus,
} from '@/queries/statuses/use-status-interactions';
import { useComposeActions } from '@/stores/compose';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';
import copy from '@/utils/copy';
import { download } from '@/utils/download';
import { shortNumberFormat } from '@/utils/numbers';

import PlaceholderEventHeader from '../../placeholder/components/placeholder-event-header';
import EventActionButton from '../components/event-action-button';
import EventDate from '../components/event-date';

import type { NormalizedStatus as Status } from '@/reducers/statuses';

const messages = defineMessages({
  bannerHeader: { id: 'event.banner', defaultMessage: 'Event banner' },
  exportIcs: { id: 'event.export_ics', defaultMessage: 'Export to your calendar' },
  copy: { id: 'event.copy', defaultMessage: 'Copy link to event' },
  external: { id: 'event.external', defaultMessage: 'View event on {domain}' },
  bookmark: { id: 'status.bookmark', defaultMessage: 'Bookmark' },
  unbookmark: { id: 'status.unbookmark', defaultMessage: 'Remove bookmark' },
  quotePost: { id: 'event.quote', defaultMessage: 'Quote event' },
  reblog: { id: 'event.reblog', defaultMessage: 'Repost event' },
  reblogPrivate: { id: 'status.reblog_private', defaultMessage: 'Repost to original audience' },
  cancelReblogPrivate: { id: 'status.cancel_reblog_private', defaultMessage: 'Un-repost' },
  reblogVisibilityPublic: {
    id: 'status.reblog_visibility_public',
    defaultMessage: 'Public repost',
  },
  reblogVisibilityUnlisted: {
    id: 'status.reblog_visibility_unlisted',
    defaultMessage: 'Quiet public repost',
  },
  reblogVisibilityPrivate: {
    id: 'status.reblog_visibility_private',
    defaultMessage: 'Followers-only repost',
  },
  unreblog: { id: 'event.unreblog', defaultMessage: 'Un-repost event' },
  pin: { id: 'status.pin', defaultMessage: 'Pin on profile' },
  unpin: { id: 'status.unpin', defaultMessage: 'Unpin from profile' },
  delete: { id: 'status.delete', defaultMessage: 'Delete' },
  mention: { id: 'status.mention', defaultMessage: 'Mention @{name}' },
  chat: { id: 'status.chat', defaultMessage: 'Chat with @{name}' },
  direct: { id: 'status.direct', defaultMessage: 'Direct message @{name}' },
  mute: { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  block: { id: 'account.block', defaultMessage: 'Block @{name}' },
  report: { id: 'account.report', defaultMessage: 'Report @{name}' },
  adminAccount: { id: 'status.admin_account', defaultMessage: 'Moderate @{name}' },
  adminStatus: {
    id: 'status.admin_status',
    defaultMessage: 'Open this post in the moderation interface',
  },
  markStatusSensitive: {
    id: 'admin.statuses.actions.mark_status_sensitive',
    defaultMessage: 'Mark post sensitive',
  },
  markStatusNotSensitive: {
    id: 'admin.statuses.actions.mark_status_not_sensitive',
    defaultMessage: 'Mark post not sensitive',
  },
  deleteStatus: { id: 'admin.statuses.actions.delete_status', defaultMessage: 'Delete post' },
});

interface IEventHeader {
  status?: Pick<
    Status,
    | 'id'
    | 'account_id'
    | 'bookmarked'
    | 'event'
    | 'group_id'
    | 'pinned'
    | 'reblog_id'
    | 'reblogged'
    | 'sensitive'
    | 'uri'
    | 'url'
    | 'visibility'
    | 'list_id'
  >;
}

const EventHeader: React.FC<IEventHeader> = ({ status }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { quoteCompose, mentionCompose, directCompose } = useComposeActions();

  const { openModal } = useModalsActions();
  const { getOrCreateChatByAccountId } = useChats();

  const features = useFeatures();
  const { boostModal } = useSettings();
  const { data: ownAccount } = useOwnAccount();
  const { data: account } = useAccount(status?.account_id!);
  const isStaff = ownAccount ? (ownAccount.is_admin ?? ownAccount.is_moderator) : false;
  const isAdmin = ownAccount ? ownAccount.is_admin : false;

  const { mutate: reblogStatus } = useReblogStatus(status?.id!);
  const { mutate: unreblogStatus } = useUnreblogStatus(status?.id!);
  const { mutate: bookmarkStatus } = useBookmarkStatus(status?.id!);
  const { mutate: unbookmarkStatus } = useUnbookmarkStatus(status?.id!);
  const { mutate: pinStatus } = usePinStatus(status?.id!);
  const { mutate: unpinStatus } = useUnpinStatus(status?.id!);

  if (!status || !status.event || !account) {
    return (
      <>
        <div className='-mx-4 -mt-4'>
          <div className='relative h-32 w-full bg-gray-200 black:rounded-t-none dark:bg-gray-900/50 md:rounded-t-xl lg:h-48' />
        </div>

        <PlaceholderEventHeader />
      </>
    );
  }
  const event = status.event;
  const banner = event.banner;

  if (!account) return null;

  const username = account.username;

  const handleHeaderClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    openModal('MEDIA', { media: [event.banner!], index: 0 });
  };

  const handleExportClick = () => {
    dispatch(fetchEventIcs(status.id))
      .then((data) => {
        download(data, 'calendar.ics');
      })
      .catch(() => {});
  };

  const handleCopy = () => {
    const { uri } = status;

    copy(uri);
  };

  const handleBookmarkClick = () => {
    if (status.bookmarked) unbookmarkStatus();
    else bookmarkStatus(undefined);
  };

  const handleReblogClick = (visibility?: string) => {
    const modalReblog = () => {
      if (status.reblogged) unreblogStatus();
      else reblogStatus(visibility);
    };
    if (!boostModal) {
      modalReblog();
    } else {
      openModal('BOOST', { statusId: status.id, onReblog: modalReblog });
    }
  };

  const handleQuoteClick = () => {
    quoteCompose(status);
  };

  const handlePinClick = () => {
    if (status.pinned) unpinStatus();
    else pinStatus();
  };

  const handleDeleteClick = () => {
    openModal('CONFIRM', {
      heading: (
        <FormattedMessage id='confirmations.delete_event.heading' defaultMessage='Delete event' />
      ),
      message: (
        <FormattedMessage
          id='confirmations.delete_event.message'
          defaultMessage='Are you sure you want to delete this event?'
        />
      ),
      confirm: <FormattedMessage id='confirmations.delete_event.confirm' defaultMessage='Delete' />,
      onConfirm: () => dispatch(deleteStatus(status.id)),
    });
  };

  const handleMentionClick = () => {
    mentionCompose(account);
  };

  const handleChatClick = () => {
    getOrCreateChatByAccountId(account.id)
      .then((chat) => navigate({ to: '/chats/$chatId', params: { chatId: chat.id } }))
      .catch(() => {});
  };

  const handleDirectClick = () => {
    directCompose(account);
  };

  const handleMuteClick = () => {
    openModal('BLOCK_MUTE', { accountId: account.id, action: 'MUTE' });
  };

  const handleBlockClick = () => {
    openModal('BLOCK_MUTE', { accountId: account.id, action: 'BLOCK' });
  };

  const handleReport = () => {
    initReport(ReportableEntities.STATUS, account, { status });
  };

  const handleToggleStatusSensitivity = () => {
    dispatch(toggleStatusSensitivityModal(intl, status.id, status.sensitive));
  };

  const handleDeleteStatus = () => {
    dispatch(deleteStatusModal(intl, status.id));
  };

  const makeMenu = (): MenuType => {
    const domain = account.fqn.split('@')[1];

    const menu: MenuType = [
      {
        text: intl.formatMessage(messages.exportIcs),
        action: handleExportClick,
        icon: require('@phosphor-icons/core/regular/calendar-plus.svg'),
      },
      {
        text: intl.formatMessage(messages.copy),
        action: handleCopy,
        icon: require('@phosphor-icons/core/regular/clipboard.svg'),
      },
    ];

    if (features.federating && !account.local) {
      menu.push({
        text: intl.formatMessage(messages.external, { domain }),
        icon: require('@phosphor-icons/core/regular/arrow-square-out.svg'),
        href: status.uri,
        target: '_blank',
      });
    }

    if (!ownAccount) return menu;

    if (features.bookmarks) {
      menu.push({
        text: intl.formatMessage(status.bookmarked ? messages.unbookmark : messages.bookmark),
        action: handleBookmarkClick,
        icon: status.bookmarked
          ? require('@phosphor-icons/core/regular/bookmark.svg')
          : require('@phosphor-icons/core/regular/bookmark-simple.svg'),
      });
    }

    if (ownAccount.id === account.id && ['public', 'unlisted'].includes(status.visibility)) {
      menu.push({
        text: intl.formatMessage(status.reblogged ? messages.unreblog : messages.reblog),
        ...(features.reblogVisibility && !status.reblogged
          ? {
              items: [
                {
                  text: intl.formatMessage(messages.reblogVisibilityPublic),
                  action: () => {
                    handleReblogClick('public');
                  },
                  icon: require('@phosphor-icons/core/regular/globe.svg'),
                },
                {
                  text: intl.formatMessage(messages.reblogVisibilityUnlisted),
                  action: () => {
                    handleReblogClick('unlisted');
                  },
                  icon: require('@phosphor-icons/core/regular/moon.svg'),
                },
                {
                  text: intl.formatMessage(messages.reblogVisibilityPrivate),
                  action: () => {
                    handleReblogClick('private');
                  },
                  icon: require('@phosphor-icons/core/regular/lock.svg'),
                },
              ],
            }
          : {
              action: () => {
                handleReblogClick();
              },
            }),
        icon: require('@phosphor-icons/core/regular/repeat.svg'),
      });

      if (features.quotePosts) {
        menu.push({
          text: intl.formatMessage(messages.quotePost),
          action: handleQuoteClick,
          icon: require('@phosphor-icons/core/regular/quotes.svg'),
        });
      }
    } else if (status.visibility === 'private' || status.visibility === 'mutuals_only') {
      menu.push({
        text: intl.formatMessage(
          status.reblogged ? messages.cancelReblogPrivate : messages.reblogPrivate,
        ),
        action: () => {
          handleReblogClick();
        },
        icon: require('@phosphor-icons/core/regular/repeat.svg'),
      });
    }

    menu.push(null);

    if (ownAccount.id === account.id) {
      if (['public', 'unlisted'].includes(status.visibility)) {
        menu.push({
          text: intl.formatMessage(status.pinned ? messages.unpin : messages.pin),
          action: handlePinClick,
          icon: status.pinned
            ? require('@phosphor-icons/core/regular/push-pin-slash.svg')
            : require('@phosphor-icons/core/regular/push-pin.svg'),
        });
      }

      menu.push({
        text: intl.formatMessage(messages.delete),
        action: handleDeleteClick,
        icon: require('@phosphor-icons/core/regular/trash.svg'),
        destructive: true,
      });
    } else {
      menu.push({
        text: intl.formatMessage(messages.mention, { name: username }),
        action: handleMentionClick,
        icon: require('@phosphor-icons/core/regular/at.svg'),
      });

      if (account.accepts_chat_messages === true) {
        menu.push({
          text: intl.formatMessage(messages.chat, { name: username }),
          action: handleChatClick,
          icon: require('@phosphor-icons/core/regular/chats-teardrop.svg'),
        });
      } else if (features.privacyScopes) {
        menu.push({
          text: intl.formatMessage(messages.direct, { name: username }),
          action: handleDirectClick,
          icon: require('@phosphor-icons/core/regular/chat-circle.svg'),
        });
      }

      menu.push(null);
      menu.push({
        text: intl.formatMessage(messages.mute, { name: username }),
        action: handleMuteClick,
        icon: require('@phosphor-icons/core/regular/speaker-simple-x.svg'),
      });
      menu.push({
        text: intl.formatMessage(messages.block, { name: username }),
        action: handleBlockClick,
        icon: require('@phosphor-icons/core/regular/prohibit.svg'),
      });
      menu.push({
        text: intl.formatMessage(messages.report, { name: username }),
        action: handleReport,
        icon: require('@phosphor-icons/core/regular/flag.svg'),
      });
    }

    if (isStaff) {
      menu.push(null);

      menu.push({
        text: intl.formatMessage(messages.adminAccount, { name: username }),
        to: '/pl-fe/admin/accounts/$accountId',
        params: { accountId: account.id },
        icon: require('@phosphor-icons/core/regular/gavel.svg'),
      });

      if (isAdmin && features.pleromaAdminStatuses) {
        menu.push({
          text: intl.formatMessage(messages.adminStatus),
          href: `/pleroma/admin/#/statuses/${status.id}/`,
          icon: require('@phosphor-icons/core/regular/pencil-simple.svg'),
        });
      }

      if (features.pleromaAdminStatuses) {
        menu.push({
          text: intl.formatMessage(
            !status.sensitive ? messages.markStatusSensitive : messages.markStatusNotSensitive,
          ),
          action: handleToggleStatusSensitivity,
          icon: require('@phosphor-icons/core/regular/warning.svg'),
        });
      }

      if (account.id !== ownAccount?.id) {
        menu.push({
          text: intl.formatMessage(messages.deleteStatus),
          action: handleDeleteStatus,
          icon: require('@phosphor-icons/core/regular/trash.svg'),
          destructive: true,
        });
      }
    }

    return menu;
  };

  const handleParticipantsClick: React.MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!ownAccount) {
      openModal('UNAUTHORIZED');
    } else {
      openModal('EVENT_PARTICIPANTS', { statusId: status.id });
    }
  };

  return (
    <>
      <div className='-mx-4 -mt-4'>
        <div className='relative h-32 w-full bg-gray-200 black:rounded-t-none dark:bg-gray-900/50 md:rounded-t-xl lg:h-48'>
          {banner && (
            <a href={banner.url} onClick={handleHeaderClick} target='_blank'>
              <StillImage
                src={banner.url}
                alt={intl.formatMessage(messages.bannerHeader)}
                className='absolute inset-0 h-full object-cover black:rounded-t-none md:rounded-t-xl'
              />
            </a>
          )}
        </div>
      </div>
      <Stack space={2}>
        <HStack className='w-full' alignItems='start' space={2}>
          <Text className='grow' size='lg' weight='bold'>
            {event.name}
          </Text>

          <DropdownMenu items={makeMenu()} placement='bottom-end'>
            <IconButton
              src={require('@phosphor-icons/core/regular/dots-three.svg')}
              theme='outlined'
              className='h-[30px] px-2'
              iconClassName='h-4 w-4'
            />
          </DropdownMenu>

          {account.id === ownAccount?.id ? (
            <Button
              size='sm'
              theme='secondary'
              to='/@{$username}/events/$statusId/edit'
              params={{ username: account.acct, statusId: status.id }}
            >
              <FormattedMessage id='event.manage' defaultMessage='Manage' />
            </Button>
          ) : (
            <EventActionButton status={status} />
          )}
        </HStack>

        <Stack space={1}>
          <HStack alignItems='center' space={2}>
            <Icon src={require('@phosphor-icons/core/regular/flag-banner.svg')} />
            <span>
              <FormattedMessage
                id='event.organized_by'
                defaultMessage='Organized by {name}'
                values={{
                  name: (
                    <Link
                      className='mention inline-block'
                      to='/@{$username}'
                      params={{ username: account.acct }}
                    >
                      <HStack space={1} alignItems='center' grow>
                        <span>
                          <Emojify text={account.display_name} emojis={account.emojis} />
                        </span>
                        {account.verified && <VerificationBadge />}
                      </HStack>
                    </Link>
                  ),
                }}
              />
            </span>
          </HStack>

          {(event.join_mode !== 'external' || event.participants_count > 0) && (
            <HStack alignItems='center' space={2}>
              <Icon src={require('@phosphor-icons/core/regular/users.svg')} />
              <a href='#' className='hover:underline' onClick={handleParticipantsClick}>
                <span>
                  <FormattedMessage
                    id='event.participants'
                    defaultMessage='{count} {rawCount, plural, one {person} other {people}} going'
                    values={{
                      rawCount: event.participants_count,
                      count: shortNumberFormat(event.participants_count),
                    }}
                  />
                </span>
              </a>
            </HStack>
          )}

          <EventDate status={status} />

          {event.location && (
            <HStack alignItems='center' space={2}>
              <Icon src={require('@phosphor-icons/core/regular/map-pin.svg')} />
              <span>{event.location.name}</span>
            </HStack>
          )}
        </Stack>
      </Stack>
    </>
  );
};

export { EventHeader as default };
