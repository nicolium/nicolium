import { useInfiniteQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Icon from 'pl-fe/components/ui/icon';
import Stack from 'pl-fe/components/ui/stack';
import { useStatContext } from 'pl-fe/contexts/stat-context';
import ComposeButton from 'pl-fe/features/ui/components/compose-button';
import ProfileDropdown from 'pl-fe/features/ui/components/profile-dropdown';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import { useRegistrationStatus } from 'pl-fe/hooks/use-registration-status';
import { useFollowRequestsCount } from 'pl-fe/queries/accounts/use-follow-requests';
import { usePendingUsersCount } from 'pl-fe/queries/admin/use-accounts';
import { usePendingReportsCount } from 'pl-fe/queries/admin/use-reports';
import { scheduledStatusesCountQueryOptions } from 'pl-fe/queries/statuses/scheduled-statuses';
import { useDraftStatusesCountQuery } from 'pl-fe/queries/statuses/use-draft-statuses';
import { useInteractionRequestsCount } from 'pl-fe/queries/statuses/use-interaction-requests';
import { useModalsActions } from 'pl-fe/stores/modals';
import sourceCode from 'pl-fe/utils/code';

import Account from './account';
import DropdownMenu, { Menu } from './dropdown-menu';
import SearchInput from './search-input';
import SidebarNavigationLink from './sidebar-navigation-link';
import SiteLogo from './site-logo';
import Avatar from './ui/avatar';

const messages = defineMessages({
  followRequests: { id: 'navigation_bar.follow_requests', defaultMessage: 'Follow requests' },
  bookmarks: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
  lists: { id: 'column.lists', defaultMessage: 'Lists' },
  circles: { id: 'column.circles', defaultMessage: 'Circles' },
  events: { id: 'column.events', defaultMessage: 'Events' },
  profileDirectory: { id: 'navigation_bar.profile_directory', defaultMessage: 'Profile directory' },
  followedTags: { id: 'navigation_bar.followed_tags', defaultMessage: 'Followed hashtags' },
  scheduledStatuses: { id: 'column.scheduled_statuses', defaultMessage: 'Scheduled posts' },
  drafts: { id: 'navigation.drafts', defaultMessage: 'Drafts' },
  conversations: { id: 'navigation.direct_messages', defaultMessage: 'Direct messages' },
  interactionRequests: { id: 'navigation.interaction_requests', defaultMessage: 'Interaction requests' },
  help: { id: 'navigation.help', defaultMessage: 'Help' },
  keyboardShortcuts: { id: 'navigation.keyboard_shortcuts', defaultMessage: 'Keyboard shortcuts' },
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
  const features = useFeatures();
  const { account } = useOwnAccount();
  const { isOpen } = useRegistrationStatus();

  const authenticatedScheduledStatusesCountQueryOptions = useMemo(() => ({
    ...scheduledStatusesCountQueryOptions,
    enabled: !!account,
  }), [!!account]);

  const notificationCount = useAppSelector((state) => state.notifications.unread);
  const followRequestsCount = useFollowRequestsCount().data || 0;
  const interactionRequestsCount = useInteractionRequestsCount().data || 0;
  const { data: awaitingApprovalCount = 0 } = usePendingUsersCount();
  const { data: pendingReportsCount = 0 } = usePendingReportsCount();
  const dashboardCount = pendingReportsCount + awaitingApprovalCount;
  const { data: scheduledStatusCount = 0 } = useInfiniteQuery(authenticatedScheduledStatusesCountQueryOptions);
  const { data: draftCount = 0 } = useDraftStatusesCountQuery();

  const restrictUnauth = instance.pleroma.metadata.restrict_unauthenticated;

  const menu = useMemo((): Menu => {
    const menu: Menu = [];

    if (account) {
      if (features.chats && features.conversations) {
        menu.push({
          to: '/conversations',
          text: intl.formatMessage(messages.conversations),
          icon: require('@phosphor-icons/core/regular/envelope-simple.svg'),
        });
      }

      if (account.locked || followRequestsCount > 0) {
        menu.push({
          to: '/follow_requests',
          text: intl.formatMessage(messages.followRequests),
          icon: require('@phosphor-icons/core/regular/user-plus.svg'),
          count: followRequestsCount,
        });
      }

      if (interactionRequestsCount > 0) {
        menu.push({
          to: '/interaction_requests',
          text: intl.formatMessage(messages.interactionRequests),
          icon: require('@phosphor-icons/core/regular/heart-half.svg'),
          count: interactionRequestsCount,
        });
      }

      if (features.bookmarks) {
        menu.push({
          to: '/bookmarks',
          text: intl.formatMessage(messages.bookmarks),
          icon: require('@phosphor-icons/core/regular/bookmarks.svg'),
        });
      }

      if (features.lists) {
        menu.push({
          to: '/lists',
          text: intl.formatMessage(messages.lists),
          icon: require('@phosphor-icons/core/regular/list-dashes.svg'),
        });
      }

      if (features.circles) {
        menu.push({
          to: '/circles',
          text: intl.formatMessage(messages.circles),
          icon: require('@phosphor-icons/core/regular/circles-three.svg'),
        });
      }

      if (features.events) {
        menu.push({
          to: '/events',
          text: intl.formatMessage(messages.events),
          icon: require('@phosphor-icons/core/regular/calendar-dots.svg'),
        });
      }

      if (features.profileDirectory) {
        menu.push({
          to: '/directory',
          text: intl.formatMessage(messages.profileDirectory),
          icon: require('@phosphor-icons/core/regular/address-book.svg'),
        });
      }

      if (features.followedHashtagsList) {
        menu.push({
          to: '/followed_tags',
          text: intl.formatMessage(messages.followedTags),
          icon: require('@phosphor-icons/core/regular/hash.svg'),
        });
      }

      if (scheduledStatusCount > 0) {
        menu.push({
          to: '/scheduled_statuses',
          icon: require('@phosphor-icons/core/regular/hourglass.svg'),
          text: intl.formatMessage(messages.scheduledStatuses),
          count: scheduledStatusCount,
        });
      }

      if (draftCount > 0) {
        menu.push({
          to: '/draft_statuses',
          icon: require('@phosphor-icons/core/regular/pencil-simple.svg'),
          text: intl.formatMessage(messages.drafts),
          count: draftCount,
        });
      }

      menu.push(null);

      menu.push({
        icon: require('@phosphor-icons/core/regular/question.svg'),
        text: intl.formatMessage(messages.help),
        items: [
          {
            action: () => openModal('HOTKEYS'),
            icon: require('@phosphor-icons/core/regular/keyboard.svg'),
            text: intl.formatMessage(messages.keyboardShortcuts),
          },
          {
            href: sourceCode.url,
            target: '_blank',
            icon: require('@phosphor-icons/core/regular/code.svg'),
            text: intl.formatMessage(messages.sourceCode),
          },
        ],
      });
    }

    return menu;
  }, [!!account, features, followRequestsCount, interactionRequestsCount, scheduledStatusCount, draftCount]);

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
                  action={<Icon src={require('@phosphor-icons/core/regular/caret-down.svg')} className='⁂-sidebar-navigation__header__account__expand' />}
                  disabled
                  withLinkToProfile={false}
                />
              )}
            </ProfileDropdown>
          </div>
          {!shrink && (
            <SearchInput />
          )}
        </div>
      )}

      <div className='⁂-sidebar-navigation__links'>
        <SidebarNavigationLink
          to='/'
          icon={require('@phosphor-icons/core/regular/house.svg')}
          activeIcon={require('@phosphor-icons/core/fill/house-fill.svg')}
          text={<FormattedMessage id='tabs_bar.home' defaultMessage='Home' />}
        />

        <SidebarNavigationLink
          to='/search'
          icon={require('@phosphor-icons/core/regular/magnifying-glass.svg')}
          activeIcon={require('@phosphor-icons/core/fill/magnifying-glass-fill.svg')}
          text={<FormattedMessage id='tabs_bar.search' defaultMessage='Search' />}
        />

        {account && (
          <>
            <SidebarNavigationLink
              to='/notifications'
              icon={require('@phosphor-icons/core/regular/bell-simple.svg')}
              activeIcon={require('@phosphor-icons/core/fill/bell-simple-fill.svg')}
              count={notificationCount}
              text={<FormattedMessage id='tabs_bar.notifications' defaultMessage='Notifications' />}
            />

            {features.chats && (
              <SidebarNavigationLink
                to='/chats'
                icon={require('@phosphor-icons/core/regular/chats-teardrop.svg')}
                activeIcon={require('@phosphor-icons/core/fill/chats-teardrop-fill.svg')}
                count={unreadChatsCount}
                countMax={9}
                text={<FormattedMessage id='navigation.chats' defaultMessage='Chats' />}
              />
            )}

            {!features.chats && features.conversations && (
              <SidebarNavigationLink
                to='/conversations'
                icon={require('@phosphor-icons/core/regular/envelope-simple.svg')}
                activeIcon={require('@phosphor-icons/core/fill/envelope-simple-fill.svg')}
                text={<FormattedMessage id='navigation.direct_messages' defaultMessage='Direct messages' />}
              />
            )}

            {features.groups && (
              <SidebarNavigationLink
                to='/groups'
                icon={require('@phosphor-icons/core/regular/users-three.svg')}
                activeIcon={require('@phosphor-icons/core/fill/users-three-fill.svg')}
                text={<FormattedMessage id='tabs_bar.groups' defaultMessage='Groups' />}
              />
            )}

            <SidebarNavigationLink
              to={`/@${account.acct}`}
              icon={require('@phosphor-icons/core/regular/user.svg')}
              activeIcon={require('@phosphor-icons/core/fill/user-fill.svg')}
              text={<FormattedMessage id='tabs_bar.profile' defaultMessage='Profile' />}
            />

            <SidebarNavigationLink
              to='/settings'
              icon={require('@phosphor-icons/core/regular/sliders-horizontal.svg')}
              activeIcon={require('@phosphor-icons/core/fill/sliders-horizontal-fill.svg')}
              text={<FormattedMessage id='tabs_bar.settings' defaultMessage='Settings' />}
            />

            {(account.is_admin || account.is_moderator) && (
              <SidebarNavigationLink
                to='/pl-fe/admin'
                icon={require('@phosphor-icons/core/regular/gauge.svg')}
                activeIcon={require('@phosphor-icons/core/fill/gauge-fill.svg')}
                count={dashboardCount}
                text={<FormattedMessage id='tabs_bar.dashboard' defaultMessage='Dashboard' />}
              />
            )}
          </>
        )}

        {(features.publicTimeline) && (
          <>
            {(features.wrenchedTimeline && (account || !restrictUnauth.timelines.wrenched)) && (
              <SidebarNavigationLink
                to='/timeline/wrenched'
                icon={require('@phosphor-icons/core/regular/wrench.svg')}
                activeIcon={require('@phosphor-icons/core/fill/wrench-fill.svg')}
                text={<FormattedMessage id='tabs_bar.wrenched' defaultMessage='Wrenched' />}
              />
            )}

            {(account || !restrictUnauth.timelines.local) && (
              <SidebarNavigationLink
                to='/timeline/local'
                icon={require('@phosphor-icons/core/regular/planet.svg')}
                activeIcon={require('@phosphor-icons/core/fill/planet-fill.svg')}
                text={features.federating ? <FormattedMessage id='tabs_bar.local' defaultMessage='Local' /> : <FormattedMessage id='tabs_bar.all' defaultMessage='All' />}
              />
            )}

            {(features.bubbleTimeline && (account || !restrictUnauth.timelines.bubble)) && (
              <SidebarNavigationLink
                to='/timeline/bubble'
                icon={require('@phosphor-icons/core/regular/graph.svg')}
                activeIcon={require('@phosphor-icons/core/fill/graph-fill.svg')}
                text={<FormattedMessage id='tabs_bar.bubble' defaultMessage='Bubble' />}
              />
            )}

            {(features.federating && (account || !restrictUnauth.timelines.federated)) && (
              <SidebarNavigationLink
                to='/timeline/fediverse'
                icon={require('@phosphor-icons/core/regular/fediverse-logo.svg')}
                activeIcon={require('@phosphor-icons/core/fill/fediverse-logo-fill.svg')}
                text={<FormattedMessage id='tabs_bar.fediverse' defaultMessage='Fediverse' />}
              />
            )}
          </>
        )}

        {menu.length > 0 && (
          <DropdownMenu items={menu} placement='top' width='16rem'>
            <SidebarNavigationLink
              icon={require('@phosphor-icons/core/regular/dots-three-circle.svg')}
              text={<FormattedMessage id='tabs_bar.more' defaultMessage='More' />}
            />
          </DropdownMenu>
        )}

        {!account && (
          <Stack className='xl:hidden' space={1.5}>
            <SidebarNavigationLink
              to='/login'
              icon={require('@phosphor-icons/core/regular/sign-in.svg')}
              activeIcon={require('@phosphor-icons/core/fill/sign-in-fill.svg')}
              text={<FormattedMessage id='account.login' defaultMessage='Log in' />}
            />

            {isOpen && <SidebarNavigationLink
              to='/signup'
              icon={require('@phosphor-icons/core/regular/user-plus.svg')}
              activeIcon={require('@phosphor-icons/core/fill/user-plus-fill.svg')}
              text={<FormattedMessage id='account.register' defaultMessage='Sign up' />}
            />}
          </Stack>
        )}
      </div>

      {account && (
        <ComposeButton shrink={shrink} />
      )}
    </div>
  );
});

export { SidebarNavigation as default };
