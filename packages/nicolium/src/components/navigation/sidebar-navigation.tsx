import iconBellSimpleFill from '@phosphor-icons/core/fill/bell-simple-fill.svg';
import iconChatsTeardropFill from '@phosphor-icons/core/fill/chats-teardrop-fill.svg';
import iconCloudFill from '@phosphor-icons/core/fill/cloud-fill.svg';
import iconEnvelopeSimpleFill from '@phosphor-icons/core/fill/envelope-simple-fill.svg';
import iconFediverseLogoFill from '@phosphor-icons/core/fill/fediverse-logo-fill.svg';
import iconGaugeFill from '@phosphor-icons/core/fill/gauge-fill.svg';
import iconGraphFill from '@phosphor-icons/core/fill/graph-fill.svg';
import iconHouseFill from '@phosphor-icons/core/fill/house-fill.svg';
import iconMagnifyingGlassFill from '@phosphor-icons/core/fill/magnifying-glass-fill.svg';
import iconPlanetFill from '@phosphor-icons/core/fill/planet-fill.svg';
import iconSignInFill from '@phosphor-icons/core/fill/sign-in-fill.svg';
import iconSlidersHorizontalFill from '@phosphor-icons/core/fill/sliders-horizontal-fill.svg';
import iconUserFill from '@phosphor-icons/core/fill/user-fill.svg';
import iconUserPlusFill from '@phosphor-icons/core/fill/user-plus-fill.svg';
import iconUsersThreeFill from '@phosphor-icons/core/fill/users-three-fill.svg';
import iconWrenchFill from '@phosphor-icons/core/fill/wrench-fill.svg';
import iconAddressBook from '@phosphor-icons/core/regular/address-book.svg';
import iconBellSimple from '@phosphor-icons/core/regular/bell-simple.svg';
import iconBookOpen from '@phosphor-icons/core/regular/book-open.svg';
import iconBookmarks from '@phosphor-icons/core/regular/bookmarks.svg';
import iconBroadcast from '@phosphor-icons/core/regular/broadcast.svg';
import iconCalendarDots from '@phosphor-icons/core/regular/calendar-dots.svg';
import iconCaretDown from '@phosphor-icons/core/regular/caret-down.svg';
import iconChatsTeardrop from '@phosphor-icons/core/regular/chats-teardrop.svg';
import iconCirclesThree from '@phosphor-icons/core/regular/circles-three.svg';
import iconCloud from '@phosphor-icons/core/regular/cloud.svg';
import iconCode from '@phosphor-icons/core/regular/code.svg';
import iconDotsThreeCircle from '@phosphor-icons/core/regular/dots-three-circle.svg';
import iconEnvelopeSimple from '@phosphor-icons/core/regular/envelope-simple.svg';
import iconFediverseLogo from '@phosphor-icons/core/regular/fediverse-logo.svg';
import iconGauge from '@phosphor-icons/core/regular/gauge.svg';
import iconGraph from '@phosphor-icons/core/regular/graph.svg';
import iconHash from '@phosphor-icons/core/regular/hash.svg';
import iconHeartHalf from '@phosphor-icons/core/regular/heart-half.svg';
import iconHourglass from '@phosphor-icons/core/regular/hourglass.svg';
import iconHouse from '@phosphor-icons/core/regular/house.svg';
import iconKeyboard from '@phosphor-icons/core/regular/keyboard.svg';
import iconListDashes from '@phosphor-icons/core/regular/list-dashes.svg';
import iconMagnifyingGlass from '@phosphor-icons/core/regular/magnifying-glass.svg';
import iconPencilSimple from '@phosphor-icons/core/regular/pencil-simple.svg';
import iconPlanet from '@phosphor-icons/core/regular/planet.svg';
import iconQuestion from '@phosphor-icons/core/regular/question.svg';
import iconRss from '@phosphor-icons/core/regular/rss.svg';
import iconSignIn from '@phosphor-icons/core/regular/sign-in.svg';
import iconSlidersHorizontal from '@phosphor-icons/core/regular/sliders-horizontal.svg';
import iconUserPlus from '@phosphor-icons/core/regular/user-plus.svg';
import iconUser from '@phosphor-icons/core/regular/user.svg';
import iconUsersThree from '@phosphor-icons/core/regular/users-three.svg';
import iconWrench from '@phosphor-icons/core/regular/wrench.svg';
import { useInfiniteQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import ComposeButton from '@/components/navigation/compose-button';
import Icon from '@/components/ui/icon';
import { useStatContext } from '@/contexts/stat-context';
import ProfileDropdown from '@/features/ui/components/profile-dropdown';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useRegistrationStatus } from '@/hooks/use-registration-status';
import { useFollowRequestsCount } from '@/queries/accounts/use-follow-requests';
import { usePendingUsersCount } from '@/queries/admin/use-accounts';
import { usePendingReportsCount } from '@/queries/admin/use-reports';
import { useNotificationsUnreadCount } from '@/queries/notifications/use-notifications';
import { scheduledStatusesCountQueryOptions } from '@/queries/statuses/scheduled-statuses';
import { useDraftStatusesCountQuery } from '@/queries/statuses/use-draft-statuses';
import { useInteractionRequestsCount } from '@/queries/statuses/use-interaction-requests';
import { useInstance } from '@/stores/instance';
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
  const { unreadChatsCount } = useStatContext();
  const { openModal } = useModalsActions();

  const instance = useInstance();
  const client = useClient();
  const features = useFeatures();
  const { data: account } = useOwnAccount();
  const { isOpen } = useRegistrationStatus();

  const authenticatedScheduledStatusesCountQueryOptions = useMemo(
    () => ({
      ...scheduledStatusesCountQueryOptions(client),
      enabled: !!account && features.scheduledStatuses,
    }),
    [client, !!account, features],
  );

  const notificationCount = useNotificationsUnreadCount();
  const followRequestsCount = useFollowRequestsCount().data ?? 0;
  const interactionRequestsCount = useInteractionRequestsCount().data ?? 0;
  const { data: awaitingApprovalCount = 0 } = usePendingUsersCount();
  const { data: pendingReportsCount = 0 } = usePendingReportsCount();
  const dashboardCount = pendingReportsCount + awaitingApprovalCount;
  const { data: scheduledStatusCount = 0 } = useInfiniteQuery(
    authenticatedScheduledStatusesCountQueryOptions,
  );
  const { data: draftCount = 0 } = useDraftStatusesCountQuery();

  const timelineAccess = instance.configuration.timelines_access;

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
          {!shrink && <SearchInput />}
        </div>
      )}

      <ul className='⁂-sidebar-navigation__links'>
        <SidebarNavigationLink
          to='/'
          icon={iconHouse}
          activeIcon={iconHouseFill}
          text={<FormattedMessage id='tabs_bar.home' defaultMessage='Home' />}
        />

        <SidebarNavigationLink
          to='/search'
          icon={iconMagnifyingGlass}
          activeIcon={iconMagnifyingGlassFill}
          text={<FormattedMessage id='tabs_bar.search' defaultMessage='Search' />}
        />

        {account && (
          <>
            <SidebarNavigationLink
              to='/notifications'
              icon={iconBellSimple}
              activeIcon={iconBellSimpleFill}
              count={notificationCount}
              text={<FormattedMessage id='tabs_bar.notifications' defaultMessage='Notifications' />}
            />

            {features.chats && (
              <SidebarNavigationLink
                to='/chats'
                icon={iconChatsTeardrop}
                activeIcon={iconChatsTeardropFill}
                count={unreadChatsCount}
                countMax={9}
                text={<FormattedMessage id='column.chats' defaultMessage='Chats' />}
              />
            )}

            {!features.chats && features.conversations && (
              <SidebarNavigationLink
                to='/conversations'
                icon={iconEnvelopeSimple}
                activeIcon={iconEnvelopeSimpleFill}
                text={<FormattedMessage id='column.direct' defaultMessage='Direct messages' />}
              />
            )}

            {features.groups && (
              <SidebarNavigationLink
                to='/groups'
                icon={iconUsersThree}
                activeIcon={iconUsersThreeFill}
                text={<FormattedMessage id='tabs_bar.groups' defaultMessage='Groups' />}
              />
            )}

            <SidebarNavigationLink
              to='/@{$username}'
              params={{ username: account.username }}
              icon={iconUser}
              activeIcon={iconUserFill}
              text={<FormattedMessage id='tabs_bar.profile' defaultMessage='Profile' />}
            />

            {features.drive && (
              <SidebarNavigationLink
                to='/drive/{-$folderId}'
                icon={iconCloud}
                activeIcon={iconCloudFill}
                text={<FormattedMessage id='column.drive' defaultMessage='Drive' />}
              />
            )}

            <SidebarNavigationLink
              to='/settings'
              icon={iconSlidersHorizontal}
              activeIcon={iconSlidersHorizontalFill}
              text={<FormattedMessage id='tabs_bar.settings' defaultMessage='Settings' />}
            />

            {(account.is_admin ?? account.is_moderator) && (
              <SidebarNavigationLink
                to='/nicolium/admin'
                icon={iconGauge}
                activeIcon={iconGaugeFill}
                count={dashboardCount}
                text={<FormattedMessage id='tabs_bar.dashboard' defaultMessage='Dashboard' />}
              />
            )}
          </>
        )}

        {features.publicTimeline && (
          <>
            {features.wrenchedTimeline &&
              (account
                ? timelineAccess.live_feeds.wrenched !== 'disabled'
                : timelineAccess.live_feeds.wrenched === 'public') && (
                <SidebarNavigationLink
                  to='/timeline/wrenched'
                  icon={iconWrench}
                  activeIcon={iconWrenchFill}
                  text={<FormattedMessage id='tabs_bar.wrenched' defaultMessage='Wrenched' />}
                />
              )}

            {(account
              ? timelineAccess.live_feeds.local !== 'disabled'
              : timelineAccess.live_feeds.local === 'public') && (
              <SidebarNavigationLink
                to='/timeline/local'
                icon={iconPlanet}
                activeIcon={iconPlanetFill}
                text={
                  features.federating ? (
                    <FormattedMessage id='tabs_bar.local' defaultMessage='Local' />
                  ) : (
                    <FormattedMessage id='tabs_bar.all' defaultMessage='All' />
                  )
                }
              />
            )}

            {features.bubbleTimeline &&
              (account
                ? timelineAccess.live_feeds.bubble !== 'disabled'
                : timelineAccess.live_feeds.bubble === 'public') && (
                <SidebarNavigationLink
                  to='/timeline/bubble'
                  icon={iconGraph}
                  activeIcon={iconGraphFill}
                  text={<FormattedMessage id='tabs_bar.bubble' defaultMessage='Bubble' />}
                />
              )}

            {features.federating &&
              (account
                ? timelineAccess.live_feeds.remote !== 'disabled'
                : timelineAccess.live_feeds.remote === 'public') && (
                <SidebarNavigationLink
                  to='/timeline/fediverse'
                  icon={iconFediverseLogo}
                  activeIcon={iconFediverseLogoFill}
                  text={<FormattedMessage id='tabs_bar.fediverse' defaultMessage='Fediverse' />}
                />
              )}
          </>
        )}

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
