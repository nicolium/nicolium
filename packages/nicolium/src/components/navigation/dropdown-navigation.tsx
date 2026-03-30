import iconAddressBook from '@phosphor-icons/core/regular/address-book.svg';
import iconBookmarks from '@phosphor-icons/core/regular/bookmarks.svg';
import iconBroadcast from '@phosphor-icons/core/regular/broadcast.svg';
import iconCalendarDots from '@phosphor-icons/core/regular/calendar-dots.svg';
import iconCaretDown from '@phosphor-icons/core/regular/caret-down.svg';
import iconCirclesThree from '@phosphor-icons/core/regular/circles-three.svg';
import iconCloud from '@phosphor-icons/core/regular/cloud.svg';
import iconCode from '@phosphor-icons/core/regular/code.svg';
import iconEnvelopeSimple from '@phosphor-icons/core/regular/envelope-simple.svg';
import iconFediverseLogo from '@phosphor-icons/core/regular/fediverse-logo.svg';
import iconGauge from '@phosphor-icons/core/regular/gauge.svg';
import iconGraph from '@phosphor-icons/core/regular/graph.svg';
import iconHash from '@phosphor-icons/core/regular/hash.svg';
import iconHeartHalf from '@phosphor-icons/core/regular/heart-half.svg';
import iconHourglass from '@phosphor-icons/core/regular/hourglass.svg';
import iconListDashes from '@phosphor-icons/core/regular/list-dashes.svg';
import iconPencilSimple from '@phosphor-icons/core/regular/pencil-simple.svg';
import iconPlanet from '@phosphor-icons/core/regular/planet.svg';
import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import iconRss from '@phosphor-icons/core/regular/rss.svg';
import iconSignIn from '@phosphor-icons/core/regular/sign-in.svg';
import iconSignOut from '@phosphor-icons/core/regular/sign-out.svg';
import iconSlidersHorizontal from '@phosphor-icons/core/regular/sliders-horizontal.svg';
import iconUserPlus from '@phosphor-icons/core/regular/user-plus.svg';
import iconUser from '@phosphor-icons/core/regular/user.svg';
import iconUsersThree from '@phosphor-icons/core/regular/users-three.svg';
import iconWrench from '@phosphor-icons/core/regular/wrench.svg';
/* eslint-disable jsx-a11y/interactive-supports-focus */
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, type LinkOptions } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Account from '@/components/accounts/account';
import ProfileStats from '@/components/accounts/profile-stats';
import Divider from '@/components/ui/divider';
import Icon from '@/components/ui/icon';
import Text from '@/components/ui/text';
import { useCurrentAccount } from '@/contexts/current-account-context';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useRegistrationStatus } from '@/hooks/use-registration-status';
import { useAccount } from '@/queries/accounts/use-account';
import { useFollowRequestsCount } from '@/queries/accounts/use-follow-requests';
import { useLoggedInAccounts } from '@/queries/accounts/use-logged-in-accounts';
import { scheduledStatusesCountQueryOptions } from '@/queries/statuses/scheduled-statuses';
import { useDraftStatusesCountQuery } from '@/queries/statuses/use-draft-statuses';
import { useInteractionRequestsCount } from '@/queries/statuses/use-interaction-requests';
import { useAuthActions } from '@/stores/auth';
import { useInstance } from '@/stores/instance';
import { useSettings } from '@/stores/settings';
import { useIsSidebarOpen, useUiStoreActions } from '@/stores/ui';
import sourceCode from '@/utils/code';
import { useIsStandalone } from '@/utils/state';

import type { Account as AccountEntity } from 'pl-api';

interface IAccountSwitcher {
  handleClose: () => void;
}

const AccountSwitcher: React.FC<IAccountSwitcher> = ({ handleClose }) => {
  const { accounts: otherAccounts } = useLoggedInAccounts();

  const { switchAccountById } = useAuthActions();

  const handleSwitchAccount =
    (account: AccountEntity): React.MouseEventHandler =>
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      switchAccountById(account.id);
    };

  const renderAccount = (account: AccountEntity) => (
    <a
      className='⁂-dropdown-navigation__account-switcher__account'
      href='#'
      onClick={handleSwitchAccount(account)}
      key={account.id}
    >
      <div>
        <Account
          account={account}
          showAccountHoverCard={false}
          withRelationship={false}
          withLinkToProfile={false}
        />
      </div>
    </a>
  );

  return (
    <div className='⁂-dropdown-navigation__account-switcher__accounts'>
      {otherAccounts.map((account) => renderAccount(account))}

      <Link
        className='⁂-dropdown-navigation__account-switcher__add'
        to='/login/add'
        onClick={handleClose}
      >
        <Icon src={iconPlus} />
        <Text size='sm' weight='medium'>
          <FormattedMessage
            id='profile_dropdown.add_account'
            defaultMessage='Add an existing account'
          />
        </Text>
      </Link>
    </div>
  );
};

interface IDropdownNavigationLink extends Partial<LinkOptions> {
  href?: string;
  icon: string;
  text: string | React.JSX.Element;
  onClick: React.EventHandler<React.MouseEvent>;
}

const DropdownNavigationLink: React.FC<IDropdownNavigationLink> = React.memo(
  ({ href, to, icon, text, onClick, ...rest }) => {
    const body = (
      <>
        <div className='⁂-dropdown-navigation__link__icon'>
          <Icon src={icon} />
        </div>

        <Text tag='span' weight='medium' theme='inherit'>
          {text}
        </Text>
      </>
    );

    if (to) {
      return (
        <Link className='⁂-dropdown-navigation__link' to={to} {...rest} onClick={onClick}>
          {body}
        </Link>
      );
    }

    return (
      <a className='⁂-dropdown-navigation__link' href={href} target='_blank' onClick={onClick}>
        {body}
      </a>
    );
  },
);

DropdownNavigationLink.displayName = 'DropdownNavigationLink';

const DropdownNavigation: React.FC = React.memo((): React.JSX.Element | null => {
  const isSidebarOpen = useIsSidebarOpen();
  const { closeSidebar } = useUiStoreActions();
  const { verifyAccounts, logOut } = useAuthActions();

  const me = useCurrentAccount();
  const client = useClient();
  const features = useFeatures();

  const authenticatedScheduledStatusesCountQueryOptions = useMemo(
    () => ({
      ...scheduledStatusesCountQueryOptions(client),
      enabled: !!me && features.scheduledStatuses,
    }),
    [me, client, features],
  );

  const { data: account } = useAccount(me || undefined);
  const settings = useSettings();
  const followRequestsCount = useFollowRequestsCount().data ?? 0;
  const interactionRequestsCount = useInteractionRequestsCount().data ?? 0;
  const scheduledStatusCount =
    useInfiniteQuery(authenticatedScheduledStatusesCountQueryOptions).data ?? 0;
  const { data: draftCount = 0 } = useDraftStatusesCountQuery();
  // const { data: awaitingApprovalCount = 0 } = usePendingUsersCount();
  // const { data: pendingReportsCount = 0 } = usePendingReportsCount();
  // const dashboardCount = pendingReportsCount + awaitingApprovalCount;
  const [sidebarVisible, setSidebarVisible] = useState(isSidebarOpen);
  const touchStart = useRef(0);
  const touchEnd = useRef<number | null>(null);
  const { isOpen } = useRegistrationStatus();
  const standalone = useIsStandalone();

  const instance = useInstance();
  const timelineAccess = instance.configuration.timelines_access;

  const containerRef = React.useRef<HTMLDivElement>(null);

  const [switcher, setSwitcher] = React.useState(false);

  const handleSwitcherClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setSwitcher((prevState) => !prevState);
  };

  const handleClose = useCallback(() => {
    setSwitcher(false);
    closeSidebar();
  }, [closeSidebar]);

  const onClickLogOut: React.MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();

    logOut();
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Escape') handleClose();
  };

  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) =>
    (touchStart.current = e.targetTouches[0].clientX);
  const handleTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) =>
    (touchEnd.current = e.targetTouches[0].clientX);

  const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = () => {
    if (touchEnd.current !== null && touchStart.current - touchEnd.current > 100) {
      handleClose();
    }
    touchEnd.current = null;
  };

  useEffect(() => {
    verifyAccounts();
  }, []);

  useEffect(() => {
    if (isSidebarOpen) containerRef.current?.querySelector('a')?.focus();
    setTimeout(
      () => {
        setSidebarVisible(isSidebarOpen);
      },
      isSidebarOpen ? 0 : 150,
    );
  }, [isSidebarOpen]);

  return (
    <div
      aria-expanded={isSidebarOpen}
      className={clsx({
        '⁂-dropdown-navigation__container': true,
        '⁂-dropdown-navigation__container--partially-visible': isSidebarOpen || sidebarVisible,
        '⁂-dropdown-navigation__container--visible': isSidebarOpen && sidebarVisible,
      })}
      ref={containerRef}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className='⁂-dropdown-navigation__overlay' role='button' onClick={handleClose} />

      <div className='⁂-dropdown-navigation' id='dropdown-navigation' role='menu'>
        {account ? (
          <div>
            <Link to='/@{$username}' params={{ username: account.acct }} onClick={closeSidebar}>
              <Account account={account} showAccountHoverCard={false} withLinkToProfile={false} />
            </Link>

            {!settings.demetricator && (
              <ProfileStats account={account} onClickHandler={handleClose} />
            )}

            <div className='flex flex-col gap-4'>
              <Divider />

              <DropdownNavigationLink
                to='/@{$username}'
                params={{ username: account.acct }}
                icon={iconUser}
                text={<FormattedMessage id='account.profile' defaultMessage='Profile' />}
                onClick={closeSidebar}
              />

              {(account.locked || followRequestsCount > 0) && (
                <DropdownNavigationLink
                  to='/follow_requests'
                  icon={iconUserPlus}
                  text={
                    <FormattedMessage
                      id='column.follow_requests'
                      defaultMessage='Follow requests'
                    />
                  }
                  onClick={closeSidebar}
                />
              )}

              {interactionRequestsCount > 0 && (
                <DropdownNavigationLink
                  to='/interaction_requests'
                  icon={iconHeartHalf}
                  text={
                    <FormattedMessage
                      id='column.interaction_requests'
                      defaultMessage='Interaction requests'
                    />
                  }
                  onClick={closeSidebar}
                />
              )}

              {features.conversations && (
                <DropdownNavigationLink
                  to='/conversations'
                  icon={iconEnvelopeSimple}
                  text={<FormattedMessage id='column.direct' defaultMessage='Direct messages' />}
                  onClick={closeSidebar}
                />
              )}

              {features.bookmarks && (
                <DropdownNavigationLink
                  to='/bookmarks'
                  icon={iconBookmarks}
                  text={<FormattedMessage id='column.bookmarks' defaultMessage='Bookmarks' />}
                  onClick={closeSidebar}
                />
              )}

              {features.groups && (
                <DropdownNavigationLink
                  to='/groups'
                  icon={iconUsersThree}
                  text={<FormattedMessage id='column.groups' defaultMessage='Groups' />}
                  onClick={closeSidebar}
                />
              )}

              {features.lists && (
                <DropdownNavigationLink
                  to='/lists'
                  icon={iconListDashes}
                  text={<FormattedMessage id='column.lists' defaultMessage='Lists' />}
                  onClick={closeSidebar}
                />
              )}

              {features.circles && (
                <DropdownNavigationLink
                  to='/circles'
                  icon={iconCirclesThree}
                  text={<FormattedMessage id='column.circles' defaultMessage='Circles' />}
                  onClick={closeSidebar}
                />
              )}

              {features.antennas && (
                <DropdownNavigationLink
                  to='/antennas'
                  icon={iconBroadcast}
                  text={<FormattedMessage id='column.antennas' defaultMessage='Antennas' />}
                  onClick={closeSidebar}
                />
              )}

              {features.drive && (
                <DropdownNavigationLink
                  to='/drive/{-$folderId}'
                  icon={iconCloud}
                  text={<FormattedMessage id='column.drive' defaultMessage='Drive' />}
                  onClick={closeSidebar}
                />
              )}

              {features.events && (
                <DropdownNavigationLink
                  to='/events'
                  icon={iconCalendarDots}
                  text={<FormattedMessage id='column.events' defaultMessage='Events' />}
                  onClick={closeSidebar}
                />
              )}

              {features.profileDirectory && (
                <DropdownNavigationLink
                  to='/directory'
                  icon={iconAddressBook}
                  text={
                    <FormattedMessage id='column.directory' defaultMessage='Profile directory' />
                  }
                  onClick={closeSidebar}
                />
              )}

              {scheduledStatusCount > 0 && (
                <DropdownNavigationLink
                  to='/scheduled_statuses'
                  icon={iconHourglass}
                  text={
                    <FormattedMessage
                      id='column.scheduled_statuses'
                      defaultMessage='Scheduled posts'
                    />
                  }
                  onClick={closeSidebar}
                />
              )}

              {draftCount > 0 && (
                <DropdownNavigationLink
                  to='/draft_statuses'
                  icon={iconPencilSimple}
                  text={<FormattedMessage id='column.draft_statuses' defaultMessage='Drafts' />}
                  onClick={closeSidebar}
                />
              )}

              {features.publicTimeline && (
                <>
                  <Divider />

                  {timelineAccess.live_feeds.local !== 'disabled' && (
                    <DropdownNavigationLink
                      to='/timeline/local'
                      icon={iconPlanet}
                      text={
                        features.federating ? (
                          <FormattedMessage id='tabs_bar.local' defaultMessage='Local' />
                        ) : (
                          <FormattedMessage id='tabs_bar.all' defaultMessage='All' />
                        )
                      }
                      onClick={closeSidebar}
                    />
                  )}

                  {features.bubbleTimeline && timelineAccess.live_feeds.bubble !== 'disabled' && (
                    <DropdownNavigationLink
                      to='/timeline/bubble'
                      icon={iconGraph}
                      text={<FormattedMessage id='tabs_bar.bubble' defaultMessage='Bubble' />}
                      onClick={closeSidebar}
                    />
                  )}

                  {features.federating && timelineAccess.live_feeds.remote !== 'disabled' && (
                    <DropdownNavigationLink
                      to='/timeline/fediverse'
                      icon={iconFediverseLogo}
                      text={<FormattedMessage id='tabs_bar.fediverse' defaultMessage='Fediverse' />}
                      onClick={closeSidebar}
                    />
                  )}

                  {features.wrenchedTimeline &&
                    timelineAccess.live_feeds.wrenched !== 'disabled' && (
                      <DropdownNavigationLink
                        to='/timeline/wrenched'
                        icon={iconWrench}
                        text={<FormattedMessage id='tabs_bar.wrenched' defaultMessage='Wrenched' />}
                        onClick={closeSidebar}
                      />
                    )}
                </>
              )}

              <Divider />

              <DropdownNavigationLink
                to='/settings'
                icon={iconSlidersHorizontal}
                text={<FormattedMessage id='column.preferences' defaultMessage='Preferences' />}
                onClick={closeSidebar}
              />

              {features.followedHashtagsList && (
                <DropdownNavigationLink
                  to='/followed_tags'
                  icon={iconHash}
                  text={
                    <FormattedMessage
                      id='column.followed_tags'
                      defaultMessage='Followed hashtags'
                    />
                  }
                  onClick={closeSidebar}
                />
              )}

              {features.rssFeedSubscriptions && (
                <DropdownNavigationLink
                  to='/rss_feed_subscriptions'
                  icon={iconRss}
                  text={
                    <FormattedMessage
                      id='column.rss_feed_subscriptions'
                      defaultMessage='Subscribed RSS feeds'
                    />
                  }
                  onClick={closeSidebar}
                />
              )}

              {(account.is_admin ?? account.is_moderator) && (
                <DropdownNavigationLink
                  to='/nicolium/admin'
                  icon={iconGauge}
                  text={<FormattedMessage id='column.admin.dashboard' defaultMessage='Dashboard' />}
                  onClick={closeSidebar}
                  // count={dashboardCount} WIP
                />
              )}

              <Divider />

              <DropdownNavigationLink
                to='/logout'
                icon={iconSignOut}
                text={<FormattedMessage id='navigation_bar.logout' defaultMessage='Logout' />}
                onClick={onClickLogOut}
              />

              <Divider />

              <DropdownNavigationLink
                href={sourceCode.url}
                icon={iconCode}
                text={<FormattedMessage id='navigation.source_code' defaultMessage='Source code' />}
                onClick={closeSidebar}
              />

              <Divider />

              <div
                className={clsx('⁂-dropdown-navigation__account-switcher', {
                  '⁂-dropdown-navigation__account-switcher--expanded': switcher,
                })}
              >
                <button type='button' onClick={handleSwitcherClick}>
                  <Text tag='span'>
                    <FormattedMessage
                      id='profile_dropdown.switch_account'
                      defaultMessage='Switch accounts'
                    />
                  </Text>

                  <Icon src={iconCaretDown} />
                </button>

                {switcher && <AccountSwitcher handleClose={handleClose} />}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {!standalone &&
              features.publicTimeline &&
              timelineAccess.live_feeds.local === 'public' && (
                <>
                  <DropdownNavigationLink
                    to='/timeline/local'
                    icon={iconPlanet}
                    text={
                      features.federating ? (
                        <FormattedMessage id='tabs_bar.local' defaultMessage='Local' />
                      ) : (
                        <FormattedMessage id='tabs_bar.all' defaultMessage='All' />
                      )
                    }
                    onClick={closeSidebar}
                  />

                  {features.bubbleTimeline && timelineAccess.live_feeds.bubble === 'public' && (
                    <DropdownNavigationLink
                      to='/timeline/bubble'
                      icon={iconGraph}
                      text={<FormattedMessage id='tabs_bar.bubble' defaultMessage='Bubble' />}
                      onClick={closeSidebar}
                    />
                  )}

                  {features.federating && timelineAccess.live_feeds.remote === 'public' && (
                    <DropdownNavigationLink
                      to='/timeline/fediverse'
                      icon={iconFediverseLogo}
                      text={<FormattedMessage id='tabs_bar.fediverse' defaultMessage='Fediverse' />}
                      onClick={closeSidebar}
                    />
                  )}

                  {features.wrenchedTimeline && timelineAccess.live_feeds.wrenched === 'public' && (
                    <DropdownNavigationLink
                      to='/timeline/wrenched'
                      icon={iconWrench}
                      text={<FormattedMessage id='tabs_bar.wrenched' defaultMessage='Wrenched' />}
                      onClick={closeSidebar}
                    />
                  )}

                  <Divider />
                </>
              )}

            <DropdownNavigationLink
              to='/login'
              icon={iconSignIn}
              text={<FormattedMessage id='account.login' defaultMessage='Log in' />}
              onClick={closeSidebar}
            />

            {isOpen && (
              <DropdownNavigationLink
                to='/signup'
                icon={iconUserPlus}
                text={<FormattedMessage id='account.register' defaultMessage='Sign up' />}
                onClick={closeSidebar}
              />
            )}

            <Divider />

            <DropdownNavigationLink
              href={sourceCode.url}
              icon={iconCode}
              text={<FormattedMessage id='navigation.source_code' defaultMessage='Source code' />}
              onClick={closeSidebar}
            />
          </div>
        )}
      </div>
    </div>
  );
});

DropdownNavigation.displayName = 'DropdownNavigation';

export { DropdownNavigation as default };
