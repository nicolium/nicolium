import iconArrowSquareOut from '@phosphor-icons/core/regular/arrow-square-out.svg';
import iconAt from '@phosphor-icons/core/regular/at.svg';
import iconBookmarkSimple from '@phosphor-icons/core/regular/bookmark-simple.svg';
import iconBookmark from '@phosphor-icons/core/regular/bookmark.svg';
import iconCalendarPlus from '@phosphor-icons/core/regular/calendar-plus.svg';
import iconChatCircle from '@phosphor-icons/core/regular/chat-circle.svg';
import iconChatsTeardrop from '@phosphor-icons/core/regular/chats-teardrop.svg';
import iconCopy from '@phosphor-icons/core/regular/copy.svg';
import iconDotsThree from '@phosphor-icons/core/regular/dots-three.svg';
import iconFlagBanner from '@phosphor-icons/core/regular/flag-banner.svg';
import iconFlag from '@phosphor-icons/core/regular/flag.svg';
import iconGavel from '@phosphor-icons/core/regular/gavel.svg';
import iconGlobe from '@phosphor-icons/core/regular/globe.svg';
import iconLinkSimpleHorizontal from '@phosphor-icons/core/regular/link-simple-horizontal.svg';
import iconLock from '@phosphor-icons/core/regular/lock.svg';
import iconMapPin from '@phosphor-icons/core/regular/map-pin.svg';
import iconMoon from '@phosphor-icons/core/regular/moon.svg';
import iconPencilSimple from '@phosphor-icons/core/regular/pencil-simple.svg';
import iconProhibit from '@phosphor-icons/core/regular/prohibit.svg';
import iconPushPinSlash from '@phosphor-icons/core/regular/push-pin-slash.svg';
import iconPushPin from '@phosphor-icons/core/regular/push-pin.svg';
import iconQuotes from '@phosphor-icons/core/regular/quotes.svg';
import iconRepeat from '@phosphor-icons/core/regular/repeat.svg';
import iconRocketLaunch from '@phosphor-icons/core/regular/rocket-launch.svg';
import iconSpeakerSimpleX from '@phosphor-icons/core/regular/speaker-simple-x.svg';
import iconTrash from '@phosphor-icons/core/regular/trash.svg';
import iconUsers from '@phosphor-icons/core/regular/users.svg';
import iconWarning from '@phosphor-icons/core/regular/warning.svg';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { AccountLink } from '@/components/accounts/account-link';
import VerificationBadge from '@/components/accounts/verification-badge';
import DropdownMenu, { type Menu as MenuType } from '@/components/dropdown-menu';
import Icon from '@/components/icon';
import PlaceholderEventHeader from '@/components/placeholders/placeholder-event-header';
import StillImage from '@/components/still-image';
import Button from '@/components/ui/button';
import IconButton from '@/components/ui/icon-button';
import Text from '@/components/ui/text';
import Emojify from '@/features/emoji/emojify';
import { useDeleteStatusModal, useToggleStatusSensitivityModal } from '@/hooks/use-admin-modals';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useAccount } from '@/queries/accounts/use-account';
import { useChats } from '@/queries/chats';
import { useDeleteStatus } from '@/queries/statuses/use-status';
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
import toast from '@/toast';
import copy from '@/utils/copy';
import { download } from '@/utils/download';
import { shortNumberFormat } from '@/utils/numbers';

import EventActionButton from './event-action-button';
import EventDate from './event-date';

import type { NormalizedStatus as Status } from '@/queries/statuses/normalize';

const messages = defineMessages({
  bannerHeader: { id: 'event.banner', defaultMessage: 'Event banner' },
  exportIcs: { id: 'event.export_ics', defaultMessage: 'Export to your calendar' },
  copy: { id: 'event.copy', defaultMessage: 'Copy link to event' },
  copySuccess: { id: 'event.copy.success', defaultMessage: 'Link to event copied to clipboard' },
  copyStatus: { id: 'status.copy_content', defaultMessage: 'Copy post content' },
  copyStatusSuccess: {
    id: 'status.copy_content.success',
    defaultMessage: 'Post content copied to clipboard',
  },
  deleteSuccess: { id: 'event.delete.success', defaultMessage: 'Event deleted' },
  deleteError: { id: 'event.delete.error', defaultMessage: 'Failed to delete event' },
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
    | 'spoiler_text'
    | 'uri'
    | 'url'
    | 'visibility'
    | 'list_id'
  >;
}

const EventHeader: React.FC<IEventHeader> = ({ status }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { quoteCompose, mentionCompose, directCompose } = useComposeActions();

  const { openModal } = useModalsActions();
  const { getOrCreateChatByAccountId } = useChats();

  const client = useClient();
  const features = useFeatures();
  const { boostModal, useRocketIconForReblogs } = useSettings();
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
  const { mutate: deleteStatus } = useDeleteStatus(status?.id!);
  const deleteStatusModal = useDeleteStatusModal(status?.id!);
  const toggleStatusSensitivityModal = useToggleStatusSensitivityModal(status?.id!);

  if (!status || !status.event || !account) {
    return (
      <>
        <div className='-mx-4 -mt-4'>
          <div className='relative h-32 w-full bg-gray-200 black:rounded-t-none dark:bg-gray-900/50 sm:rounded-t-xl lg:h-48' />
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
    client.events
      .getEventIcs(status.id)
      .then((data) => {
        download(data, 'calendar.ics');
      })
      .catch(() => {});
  };

  const handleCopyStatus = () => {
    let content = document
      .querySelector(`article[data-status-id="${status.id}"] [data-markup="true"]`)
      ?.textContent?.trim();
    if (content) {
      if (status.spoiler_text.length) content = `${status.spoiler_text}\n\n${content}`;
      copy(content, () => toast.success(messages.copyStatusSuccess));
    }
  };

  const handleCopy = () => {
    const { uri } = status;

    copy(uri, () => toast.success(messages.copySuccess));
  };

  const handleBookmarkClick = () => {
    if (status.bookmarked) unbookmarkStatus();
    else bookmarkStatus(undefined);
  };

  const handleReblogClick = (visibility?: string) => {
    const modalReblog = (selectedVisibility = visibility, scheduledAt?: string) => {
      if (status.reblogged) unreblogStatus();
      else reblogStatus({ visibility: selectedVisibility, scheduledAt });
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
      onConfirm: () =>
        deleteStatus(undefined, {
          onSuccess: () => toast.success(messages.deleteSuccess),
          onError: () => toast.error(messages.deleteError),
        }),
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
    openModal('REPORT', { accountId: account.id, statusIds: [status.id] });
  };

  const handleToggleStatusSensitivity = () => {
    toggleStatusSensitivityModal(status.sensitive);
  };

  const handleDeleteStatus = () => {
    deleteStatusModal();
  };

  const makeMenu = (): MenuType => {
    const domain = account.fqn.split('@')[1];

    const menu: MenuType = [
      {
        text: intl.formatMessage(messages.exportIcs),
        action: handleExportClick,
        icon: iconCalendarPlus,
      },
    ];

    menu.push({
      text: intl.formatMessage(messages.copyStatus),
      action: handleCopyStatus,
      icon: iconCopy,
    });

    menu.push({
      text: intl.formatMessage(messages.copy),
      action: handleCopy,
      icon: iconLinkSimpleHorizontal,
    });

    if (features.federating && !account.local) {
      menu.push({
        text: intl.formatMessage(messages.external, { domain }),
        icon: iconArrowSquareOut,
        href: status.uri,
        target: '_blank',
      });
    }

    if (!ownAccount) return menu;

    if (features.bookmarks) {
      menu.push({
        text: intl.formatMessage(status.bookmarked ? messages.unbookmark : messages.bookmark),
        action: handleBookmarkClick,
        icon: status.bookmarked ? iconBookmark : iconBookmarkSimple,
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
                  icon: iconGlobe,
                },
                {
                  text: intl.formatMessage(messages.reblogVisibilityUnlisted),
                  action: () => {
                    handleReblogClick('unlisted');
                  },
                  icon: iconMoon,
                },
                {
                  text: intl.formatMessage(messages.reblogVisibilityPrivate),
                  action: () => {
                    handleReblogClick('private');
                  },
                  icon: iconLock,
                },
              ],
            }
          : {
              action: () => {
                handleReblogClick();
              },
            }),
        icon: useRocketIconForReblogs ? iconRocketLaunch : iconRepeat,
      });

      if (features.quotePosts) {
        menu.push({
          text: intl.formatMessage(messages.quotePost),
          action: handleQuoteClick,
          icon: iconQuotes,
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
        icon: useRocketIconForReblogs ? iconRocketLaunch : iconRepeat,
      });
    }

    menu.push(null);

    if (ownAccount.id === account.id) {
      if (['public', 'unlisted'].includes(status.visibility)) {
        menu.push({
          text: intl.formatMessage(status.pinned ? messages.unpin : messages.pin),
          action: handlePinClick,
          icon: status.pinned ? iconPushPinSlash : iconPushPin,
        });
      }

      menu.push({
        text: intl.formatMessage(messages.delete),
        action: handleDeleteClick,
        icon: iconTrash,
        destructive: true,
      });
    } else {
      menu.push({
        text: intl.formatMessage(messages.mention, { name: username }),
        action: handleMentionClick,
        icon: iconAt,
      });

      if (account.accepts_chat_messages === true) {
        menu.push({
          text: intl.formatMessage(messages.chat, { name: username }),
          action: handleChatClick,
          icon: iconChatsTeardrop,
        });
      } else if (features.privacyScopes) {
        menu.push({
          text: intl.formatMessage(messages.direct, { name: username }),
          action: handleDirectClick,
          icon: iconChatCircle,
        });
      }

      menu.push(null);
      menu.push({
        text: intl.formatMessage(messages.mute, { name: username }),
        action: handleMuteClick,
        icon: iconSpeakerSimpleX,
      });
      menu.push({
        text: intl.formatMessage(messages.block, { name: username }),
        action: handleBlockClick,
        icon: iconProhibit,
      });
      menu.push({
        text: intl.formatMessage(messages.report, { name: username }),
        action: handleReport,
        icon: iconFlag,
      });
    }

    if (isStaff) {
      menu.push(null);

      menu.push({
        text: intl.formatMessage(messages.adminAccount, { name: username }),
        to: '/nicolium/admin/accounts/$accountId',
        params: { accountId: account.id },
        icon: iconGavel,
      });

      if (isAdmin && features.pleromaAdminStatuses) {
        menu.push({
          text: intl.formatMessage(messages.adminStatus),
          href: `/pleroma/admin/#/statuses/${status.id}/`,
          icon: iconPencilSimple,
        });
      }

      if (features.pleromaAdminStatuses) {
        menu.push({
          text: intl.formatMessage(
            !status.sensitive ? messages.markStatusSensitive : messages.markStatusNotSensitive,
          ),
          action: handleToggleStatusSensitivity,
          icon: iconWarning,
        });
      }

      if (account.id !== ownAccount?.id) {
        menu.push({
          text: intl.formatMessage(messages.deleteStatus),
          action: handleDeleteStatus,
          icon: iconTrash,
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
        <div className='relative h-32 w-full bg-gray-200 black:rounded-t-none dark:bg-gray-900/50 sm:rounded-t-xl lg:h-48'>
          {banner && (
            <a href={banner.url} onClick={handleHeaderClick} target='_blank'>
              <StillImage
                src={banner.url}
                alt={intl.formatMessage(messages.bannerHeader)}
                className='absolute inset-0 h-full overflow-hidden object-cover black:rounded-t-none sm:rounded-t-xl'
              />
            </a>
          )}
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        <div className='flex w-full items-start gap-2'>
          <Text className='grow' size='lg' weight='bold'>
            {event.name}
          </Text>

          <DropdownMenu items={makeMenu()} placement='bottom-end'>
            <IconButton
              src={iconDotsThree}
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
        </div>

        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <Icon src={iconFlagBanner} />
            <span>
              <FormattedMessage
                id='event.organized_by'
                defaultMessage='Organized by {name}'
                values={{
                  name: (
                    <AccountLink className='mention inline-block' account={account}>
                      <div className='flex flex-grow items-center gap-1'>
                        <span>
                          <Emojify text={account.display_name} emojis={account.emojis} />
                        </span>
                        {account.verified && <VerificationBadge />}
                      </div>
                    </AccountLink>
                  ),
                }}
              />
            </span>
          </div>

          {(event.join_mode !== 'external' || event.participants_count > 0) && (
            <div className='flex items-center gap-2'>
              <Icon src={iconUsers} />
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
            </div>
          )}

          <EventDate status={status} />

          {event.location && (
            <div className='flex items-center gap-2'>
              <Icon src={iconMapPin} />
              <span>{event.location.name}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export { EventHeader as default };
