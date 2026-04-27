import iconSignInFill from '@phosphor-icons/core/fill/sign-in-fill.svg';
import iconUserPlusFill from '@phosphor-icons/core/fill/user-plus-fill.svg';
import iconAddressBook from '@phosphor-icons/core/regular/address-book.svg';
import iconBookOpen from '@phosphor-icons/core/regular/book-open.svg';
import iconBookmarks from '@phosphor-icons/core/regular/bookmarks.svg';
import iconBroadcast from '@phosphor-icons/core/regular/broadcast.svg';
import iconCalendarDots from '@phosphor-icons/core/regular/calendar-dots.svg';
import iconCaretDown from '@phosphor-icons/core/regular/caret-down.svg';
import iconCirclesThree from '@phosphor-icons/core/regular/circles-three.svg';
import iconCode from '@phosphor-icons/core/regular/code.svg';
import iconDotsThreeCircle from '@phosphor-icons/core/regular/dots-three-circle.svg';
import iconEnvelopeSimple from '@phosphor-icons/core/regular/envelope-simple.svg';
import iconHash from '@phosphor-icons/core/regular/hash.svg';
import iconHeartHalf from '@phosphor-icons/core/regular/heart-half.svg';
import iconHourglass from '@phosphor-icons/core/regular/hourglass.svg';
import iconKeyboard from '@phosphor-icons/core/regular/keyboard.svg';
import iconListDashes from '@phosphor-icons/core/regular/list-dashes.svg';
import iconPencilSimple from '@phosphor-icons/core/regular/pencil-simple.svg';
import iconQuestion from '@phosphor-icons/core/regular/question.svg';
import iconRss from '@phosphor-icons/core/regular/rss.svg';
import iconSignIn from '@phosphor-icons/core/regular/sign-in.svg';
import iconUserPlus from '@phosphor-icons/core/regular/user-plus.svg';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import ComposeButton from '@/components/navigation/compose-button';
import ProfileDropdown from '@/components/navigation/profile-dropdown';
import Icon from '@/components/ui/icon';
import { useFeatures } from '@/hooks/use-features';
import { useNavigationItems } from '@/hooks/use-navigation-items';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useRegistrationStatus } from '@/hooks/use-registration-status';
import { useFollowRequestsCount } from '@/queries/accounts/use-follow-requests';
import { useScheduledStatusesCountQuery } from '@/queries/statuses/scheduled-statuses';
import { useDraftStatusesCountQuery } from '@/queries/statuses/use-draft-statuses';
import { useInteractionRequestsCount } from '@/queries/statuses/use-interaction-requests';
import { useModalsActions } from '@/stores/modals';
import sourceCode from '@/utils/code';

import Account from '../accounts/account';
import DropdownMenu, { type Menu } from '../dropdown-menu';
import SearchInput from '../search-input';
import SiteLogo from '../site-logo';
import Avatar from '../ui/avatar';

import SidebarNavigationLink from './sidebar-navigation-link';

const messages = defineMessages({
  followRequests: { id: 'column.follow_requests', defaultMessage: 'Follow requests' },
  bookmarks: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
  lists: { id: 'column.lists', defaultMessage: 'Lists' },
  circles: { id: 'column.circles', defaultMessage: 'Circles' },
  events: { id: 'column.events', defaultMessage: 'Events' },
  profileDirectory: { id: 'column.directory', defaultMessage: 'Profile directory' },
  followedTags: { id: 'column.followed_tags', defaultMessage: 'Followed hashtags' },
  rssFeedSubscriptions: {
    id: 'navigation_bar.rss_feed_subscriptions',
    defaultMessage: 'Subscribed RSS feeds',
  },
  scheduledStatuses: { id: 'column.scheduled_statuses', defaultMessage: 'Scheduled posts' },
  drafts: { id: 'column.draft_statuses', defaultMessage: 'Drafts' },
  conversations: { id: 'column.direct', defaultMessage: 'Direct messages' },
  interactionRequests: {
    id: 'column.interaction_requests',
    defaultMessage: 'Interaction requests',
  },
  help: { id: 'navigation.help', defaultMessage: 'Help' },
  keyboardShortcuts: { id: 'navigation.keyboard_shortcuts', defaultMessage: 'Keyboard shortcuts' },
  docs: { id: 'navigation.docs', defaultMessage: 'Documentation' },
  sourceCode: { id: 'navigation.source_code', defaultMessage: 'Source code' },
});

interface ISidebarNavigation {
  /** Whether the sidebar is in shrinked mode. */
  shrink?: boolean;
}

/** Desktop sidebar with links to different views in the app. */
const SidebarNavigation: React.FC<ISidebarNavigation> = React.memo(({ shrink }) => {
  const intl = useIntl();
  const { openModal } = useModalsActions();

  const features = useFeatures();
  const { data: account } = useOwnAccount();
  const { isOpen } = useRegistrationStatus();

  const followRequestsCount = useFollowRequestsCount().data ?? 0;
  const interactionRequestsCount = useInteractionRequestsCount().data ?? 0;
  const { data: scheduledStatusCount = 0 } = useScheduledStatusesCountQuery();
  const { data: draftCount = 0 } = useDraftStatusesCountQuery();

  const navigationItems = useNavigationItems();

  const menu = useMemo((): Menu => {
    const menu: Menu = [];

    if (account) {
      if (features.chats && features.conversations) {
        menu.push({
          to: '/conversations',
          text: intl.formatMessage(messages.conversations),
          icon: iconEnvelopeSimple,
        });
      }

      if (account.locked || followRequestsCount > 0) {
        menu.push({
          to: '/follow_requests',
          text: intl.formatMessage(messages.followRequests),
          icon: iconUserPlus,
          count: followRequestsCount,
        });
      }

      if (interactionRequestsCount > 0) {
        menu.push({
          to: '/interaction_requests',
          text: intl.formatMessage(messages.interactionRequests),
          icon: iconHeartHalf,
          count: interactionRequestsCount,
        });
      }

      if (features.bookmarks) {
        menu.push({
          to: '/bookmarks',
          text: intl.formatMessage(messages.bookmarks),
          icon: iconBookmarks,
        });
      }

      if (features.lists) {
        menu.push({
          to: '/lists',
          text: intl.formatMessage(messages.lists),
          icon: iconListDashes,
        });
      }

      if (features.circles) {
        menu.push({
          to: '/circles',
          text: intl.formatMessage(messages.circles),
          icon: iconCirclesThree,
        });
      }

      if (features.antennas) {
        menu.push({
          to: '/antennas',
          text: intl.formatMessage({ id: 'column.antennas', defaultMessage: 'Antennas' }),
          icon: iconBroadcast,
        });
      }

      if (features.events) {
        menu.push({
          to: '/events',
          text: intl.formatMessage(messages.events),
          icon: iconCalendarDots,
        });
      }

      if (features.profileDirectory) {
        menu.push({
          to: '/directory',
          text: intl.formatMessage(messages.profileDirectory),
          icon: iconAddressBook,
        });
      }

      if (features.followedHashtagsList) {
        menu.push({
          to: '/followed_tags',
          text: intl.formatMessage(messages.followedTags),
          icon: iconHash,
        });
      }

      if (features.rssFeedSubscriptions) {
        menu.push({
          to: '/rss_feed_subscriptions',
          text: intl.formatMessage(messages.rssFeedSubscriptions),
          icon: iconRss,
        });
      }

      if (scheduledStatusCount > 0) {
        menu.push({
          to: '/scheduled_statuses',
          icon: iconHourglass,
          text: intl.formatMessage(messages.scheduledStatuses),
          count: scheduledStatusCount,
        });
      }

      if (draftCount > 0) {
        menu.push({
          to: '/draft_statuses',
          icon: iconPencilSimple,
          text: intl.formatMessage(messages.drafts),
          count: draftCount,
        });
      }

      menu.push(null);

      menu.push({
        icon: iconQuestion,
        text: intl.formatMessage(messages.help),
        items: [
          {
            action: () => {
              openModal('HOTKEYS');
            },
            icon: iconKeyboard,
            text: intl.formatMessage(messages.keyboardShortcuts),
          },
          {
            href: 'https://nicolium.app/docs/',
            target: '_blank',
            icon: iconBookOpen,
            text: intl.formatMessage(messages.docs),
          },
          {
            href: sourceCode.url,
            target: '_blank',
            icon: iconCode,
            text: intl.formatMessage(messages.sourceCode),
          },
        ],
      });
    }

    return menu;
  }, [
    !!account,
    features,
    followRequestsCount,
    interactionRequestsCount,
    scheduledStatusCount,
    draftCount,
  ]);

  return (
    <div className={clsx('⁂-sidebar-navigation', { '⁂-sidebar-navigation--narrow': shrink })}>
      <SiteLogo />

      {account && (
        <div className='⁂-sidebar-navigation__header'>
          <div className='⁂-sidebar-navigation__header__account'>
            <ProfileDropdown account={account}>
              {shrink ? (
                <Avatar
                  src={account.avatar}
                  alt={account.avatar_description}
                  isCat={account.is_cat}
                  username={account.username}
                  size={40}
                />
              ) : (
                <Account
                  account={account}
                  action={
                    <Icon
                      src={iconCaretDown}
                      className='⁂-sidebar-navigation__header__account__expand'
                    />
                  }
                  disabled
                  withLinkToProfile={false}
                />
              )}
            </ProfileDropdown>
          </div>
        </div>
      )}

      <ul className='⁂-sidebar-navigation__links'>
        {navigationItems.map((item) => {
          if (item === null) return null;

          switch (item.type) {
            case 'compose':
              return null;
            case 'search-input':
              if (shrink) return null;
              return (
                <li key='search-input'>
                  <SearchInput />
                </li>
              );
            default:
              return <SidebarNavigationLink key={item.to} {...item} />;
          }
        })}

        {menu.length > 0 && (
          <DropdownMenu items={menu} placement='top' width='16rem'>
            <SidebarNavigationLink
              icon={iconDotsThreeCircle}
              text={<FormattedMessage id='tabs_bar.more' defaultMessage='More' />}
            />
          </DropdownMenu>
        )}

        {!account && (
          <div className='flex flex-col gap-1.5 xl:hidden'>
            <SidebarNavigationLink
              to='/login'
              icon={iconSignIn}
              activeIcon={iconSignInFill}
              text={<FormattedMessage id='account.login' defaultMessage='Log in' />}
            />

            {isOpen && (
              <SidebarNavigationLink
                to='/signup'
                icon={iconUserPlus}
                activeIcon={iconUserPlusFill}
                text={<FormattedMessage id='account.register' defaultMessage='Sign up' />}
              />
            )}
          </div>
        )}
      </ul>

      {account && <ComposeButton shrink={shrink} />}
    </div>
  );
});

SidebarNavigation.displayName = 'SidebarNavigation';

export { SidebarNavigation as default };
