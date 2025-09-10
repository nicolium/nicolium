/* eslint-disable jsx-a11y/interactive-supports-focus */
import { useInfiniteQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import { Link, NavLink } from 'react-router-dom';

import { fetchOwnAccounts, logOut, switchAccount } from 'pl-fe/actions/auth';
import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import Account from 'pl-fe/components/account';
import Divider from 'pl-fe/components/ui/divider';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import ProfileStats from 'pl-fe/features/ui/components/profile-stats';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { useRegistrationStatus } from 'pl-fe/hooks/use-registration-status';
import { useFollowRequestsCount } from 'pl-fe/queries/accounts/use-follow-requests';
import { scheduledStatusesCountQueryOptions } from 'pl-fe/queries/statuses/scheduled-statuses';
import { useInteractionRequestsCount } from 'pl-fe/queries/statuses/use-interaction-requests';
import { makeGetOtherAccounts } from 'pl-fe/selectors';
import { useSettingsStore } from 'pl-fe/stores/settings';
import { useUiStore } from 'pl-fe/stores/ui';
import sourceCode from 'pl-fe/utils/code';

import type { Account as AccountEntity } from 'pl-fe/normalizers/account';

const messages = defineMessages({
  profile: { id: 'account.profile', defaultMessage: 'Profile' },
  preferences: { id: 'navigation_bar.preferences', defaultMessage: 'Preferences' },
  followedTags: { id: 'navigation_bar.followed_tags', defaultMessage: 'Followed hashtags' },
  logout: { id: 'navigation_bar.logout', defaultMessage: 'Logout' },
  profileDirectory: { id: 'navigation_bar.profile_directory', defaultMessage: 'Profile directory' },
  bookmarks: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
  lists: { id: 'column.lists', defaultMessage: 'Lists' },
  circles: { id: 'column.circles', defaultMessage: 'Circles' },
  groups: { id: 'column.groups', defaultMessage: 'Groups' },
  events: { id: 'column.events', defaultMessage: 'Events' },
  dashboard: { id: 'navigation.dashboard', defaultMessage: 'Dashboard' },
  scheduledStatuses: { id: 'column.scheduled_statuses', defaultMessage: 'Scheduled posts' },
  drafts: { id: 'navigation.drafts', defaultMessage: 'Drafts' },
  addAccount: { id: 'profile_dropdown.add_account', defaultMessage: 'Add an existing account' },
  followRequests: { id: 'navigation_bar.follow_requests', defaultMessage: 'Follow requests' },
  interactionRequests: { id: 'navigation.interaction_requests', defaultMessage: 'Interaction requests' },
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
  login: { id: 'account.login', defaultMessage: 'Log in' },
  register: { id: 'account.register', defaultMessage: 'Sign up' },
  sourceCode: { id: 'navigation.source_code', defaultMessage: 'Source code' },
  conversations: { id: 'navigation.direct_messages', defaultMessage: 'Direct messages' },
});

interface IDropdownNavigationLink {
  href?: string;
  to?: string;
  icon: string;
  text: string | JSX.Element;
  onClick: React.EventHandler<React.MouseEvent>;
}

const DropdownNavigationLink: React.FC<IDropdownNavigationLink> = React.memo(({ href, to, icon, text, onClick }) => {
  const body = (
    <>
      <div className='⁂-dropdown-navigation__link__icon'>
        <Icon src={icon} />
      </div>

      <Text tag='span' weight='medium' theme='inherit'>{text}</Text>
    </>
  );

  if (to) {
    return (
      <NavLink className='⁂-dropdown-navigation__link' to={to} onClick={onClick}>
        {body}
      </NavLink>
    );
  }

  return (
    <a className='⁂-dropdown-navigation__link' href={href} target='_blank' onClick={onClick}>
      {body}
    </a>
  );
});

const DropdownNavigation: React.FC = React.memo((): JSX.Element | null => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const { isSidebarOpen, closeSidebar } = useUiStore();

  const me = useAppSelector((state) => state.me);

  const authenticatedScheduledStatusesCountQueryOptions = useMemo(() => ({
    ...scheduledStatusesCountQueryOptions,
    enabled: !!me,
  }), [me]);

  const getOtherAccounts = useCallback(makeGetOtherAccounts(), []);
  const features = useFeatures();
  const { account } = useAccount(me || undefined);
  const otherAccounts = useAppSelector((state) => getOtherAccounts(state));
  const { settings } = useSettingsStore();
  const followRequestsCount = useFollowRequestsCount().data || 0;
  const interactionRequestsCount = useInteractionRequestsCount().data || 0;
  const scheduledStatusCount = useInfiniteQuery(authenticatedScheduledStatusesCountQueryOptions).data || 0;
  const draftCount = useAppSelector((state) => Object.keys(state.draft_statuses).length);
  // const dashboardCount = useAppSelector((state) => state.admin.openReports.count() + state.admin.awaitingApproval.count());
  const [sidebarVisible, setSidebarVisible] = useState(isSidebarOpen);
  const touchStart = useRef(0);
  const touchEnd = useRef<number | null>(null);
  const { isOpen } = useRegistrationStatus();

  const instance = useInstance();
  const restrictUnauth = instance.pleroma.metadata.restrict_unauthenticated;

  const containerRef = React.useRef<HTMLDivElement>(null);

  const [switcher, setSwitcher] = React.useState(false);

  const handleClose = () => {
    setSwitcher(false);
    closeSidebar();
  };

  const handleSwitchAccount = (account: AccountEntity): React.MouseEventHandler => (e) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(switchAccount(account.id));
  };

  const onClickLogOut: React.MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(logOut());
  };

  const handleSwitcherClick: React.MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setSwitcher((prevState) => (!prevState));
  };

  const renderAccount = (account: AccountEntity) => (
    <a href='#' onClick={handleSwitchAccount(account)} key={account.id}>
      <div>
        <Account account={account} showAccountHoverCard={false} withRelationship={false} withLinkToProfile={false} />
      </div>
    </a>
  );

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Escape') handleClose();
  };

  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => touchStart.current = e.targetTouches[0].clientX;
  const handleTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => touchEnd.current = e.targetTouches[0].clientX;

  const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (touchEnd.current !== null && touchStart.current - touchEnd.current > 100) {
      handleClose();
    }
    touchEnd.current = null;
  };

  useEffect(() => {
    dispatch(fetchOwnAccounts());
  }, []);

  useEffect(() => {
    if (isSidebarOpen) containerRef.current?.querySelector('a')?.focus();
    setTimeout(() => setSidebarVisible(isSidebarOpen), isSidebarOpen ? 0 : 150);
  }, [isSidebarOpen]);

  return (
    <div
      aria-expanded={isSidebarOpen}
      className={
        clsx({
          '⁂-dropdown-navigation__container': true,
          '⁂-dropdown-navigation__container--partially-visible': isSidebarOpen || sidebarVisible,
          '⁂-dropdown-navigation__container--visible': isSidebarOpen && sidebarVisible,
        })
      }
      ref={containerRef}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className='⁂-dropdown-navigation__overlay'
        role='button'
        onClick={handleClose}
      />

      <div
        className='⁂-dropdown-navigation'
      >
        {account ? (
          <div>
            <Link to={`/@${account.acct}`} onClick={closeSidebar}>
              <Account account={account} showAccountHoverCard={false} withLinkToProfile={false} />
            </Link>

            {!settings.demetricator && (
              <ProfileStats
                account={account}
                onClickHandler={handleClose}
              />
            )}

            <Stack space={4}>
              <Divider />

              <DropdownNavigationLink
                to={`/@${account.acct}`}
                icon={require('@tabler/icons/outline/user.svg')}
                text={intl.formatMessage(messages.profile)}
                onClick={closeSidebar}
              />

              {(account.locked || followRequestsCount > 0) && (
                <DropdownNavigationLink
                  to='/follow_requests'
                  icon={require('@tabler/icons/outline/user-plus.svg')}
                  text={intl.formatMessage(messages.followRequests)}
                  onClick={closeSidebar}
                />
              )}

              {(interactionRequestsCount > 0) && (
                <DropdownNavigationLink
                  to='/interaction_requests'
                  icon={require('@tabler/icons/outline/flag-question.svg')}
                  text={intl.formatMessage(messages.interactionRequests)}
                  onClick={closeSidebar}
                />
              )}

              {features.conversations && (
                <DropdownNavigationLink
                  to='/conversations'
                  icon={require('@tabler/icons/outline/mail.svg')}
                  text={intl.formatMessage(messages.conversations)}
                  onClick={closeSidebar}
                />
              )}

              {features.bookmarks && (
                <DropdownNavigationLink
                  to='/bookmarks'
                  icon={require('@tabler/icons/outline/bookmark.svg')}
                  text={intl.formatMessage(messages.bookmarks)}
                  onClick={closeSidebar}
                />
              )}

              {features.groups && (
                <DropdownNavigationLink
                  to='/groups'
                  icon={require('@tabler/icons/outline/circles.svg')}
                  text={intl.formatMessage(messages.groups)}
                  onClick={closeSidebar}
                />
              )}

              {features.lists && (
                <DropdownNavigationLink
                  to='/lists'
                  icon={require('@tabler/icons/outline/list.svg')}
                  text={intl.formatMessage(messages.lists)}
                  onClick={closeSidebar}
                />
              )}

              {features.circles && (
                <DropdownNavigationLink
                  to='/circles'
                  icon={require('@tabler/icons/outline/chart-circles.svg')}
                  text={intl.formatMessage(messages.circles)}
                  onClick={closeSidebar}
                />
              )}

              {features.events && (
                <DropdownNavigationLink
                  to='/events'
                  icon={require('@tabler/icons/outline/calendar-event.svg')}
                  text={intl.formatMessage(messages.events)}
                  onClick={closeSidebar}
                />
              )}

              {features.profileDirectory && (
                <DropdownNavigationLink
                  to='/directory'
                  icon={require('@tabler/icons/outline/address-book.svg')}
                  text={intl.formatMessage(messages.profileDirectory)}
                  onClick={closeSidebar}
                />
              )}

              {scheduledStatusCount > 0 && (
                <DropdownNavigationLink
                  to='/scheduled_statuses'
                  icon={require('@tabler/icons/outline/calendar-stats.svg')}
                  text={intl.formatMessage(messages.scheduledStatuses)}
                  onClick={closeSidebar}
                />
              )}

              {draftCount > 0 && (
                <DropdownNavigationLink
                  to='/draft_statuses'
                  icon={require('@tabler/icons/outline/notes.svg')}
                  text={intl.formatMessage(messages.drafts)}
                  onClick={closeSidebar}
                />
              )}

              {features.publicTimeline && <>
                <Divider />

                <DropdownNavigationLink
                  to='/timeline/local'
                  icon={features.federating ? require('@tabler/icons/outline/affiliate.svg') : require('@tabler/icons/outline/world.svg')}
                  text={features.federating ? <FormattedMessage id='tabs_bar.local' defaultMessage='Local' /> : <FormattedMessage id='tabs_bar.all' defaultMessage='All' />}
                  onClick={closeSidebar}
                />

                {features.bubbleTimeline && (
                  <DropdownNavigationLink
                    to='/timeline/bubble'
                    icon={require('@tabler/icons/outline/chart-bubble.svg')}
                    text={<FormattedMessage id='tabs_bar.bubble' defaultMessage='Bubble' />}
                    onClick={closeSidebar}
                  />
                )}

                {features.federating && (
                  <DropdownNavigationLink
                    to='/timeline/fediverse'
                    icon={require('@tabler/icons/outline/topology-star-ring-3.svg')}
                    text={<FormattedMessage id='tabs_bar.fediverse' defaultMessage='Fediverse' />}
                    onClick={closeSidebar}
                  />
                )}
              </>}

              <Divider />

              <DropdownNavigationLink
                to='/settings/preferences'
                icon={require('@tabler/icons/outline/settings.svg')}
                text={intl.formatMessage(messages.preferences)}
                onClick={closeSidebar}
              />

              {features.followedHashtagsList && (
                <DropdownNavigationLink
                  to='/followed_tags'
                  icon={require('@tabler/icons/outline/hash.svg')}
                  text={intl.formatMessage(messages.followedTags)}
                  onClick={closeSidebar}
                />
              )}

              {(account.is_admin || account.is_moderator) && (
                <DropdownNavigationLink
                  to='/admin'
                  icon={require('@tabler/icons/outline/dashboard.svg')}
                  text={intl.formatMessage(messages.dashboard)}
                  onClick={closeSidebar}
                  // count={dashboardCount} WIP
                />
              )}

              <Divider />

              <DropdownNavigationLink
                to='/logout'
                icon={require('@tabler/icons/outline/logout.svg')}
                text={intl.formatMessage(messages.logout)}
                onClick={onClickLogOut}
              />

              <Divider />

              <DropdownNavigationLink
                href={sourceCode.url}
                icon={require('@tabler/icons/outline/code.svg')}
                text={intl.formatMessage(messages.sourceCode)}
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
                    <FormattedMessage id='profile_dropdown.switch_account' defaultMessage='Switch accounts' />
                  </Text>

                  <Icon
                    src={require('@tabler/icons/outline/chevron-down.svg')}
                  />
                </button>

                {switcher && (
                  <div className='⁂-dropdown-navigation__account-switcher__accounts'>
                    {otherAccounts.map(account => renderAccount(account))}

                    <NavLink className='⁂-dropdown-navigation__account-switcher__add' to='/login/add' onClick={handleClose}>
                      <Icon src={require('@tabler/icons/outline/plus.svg')} />
                      <Text size='sm' weight='medium'>{intl.formatMessage(messages.addAccount)}</Text>
                    </NavLink>
                  </div>
                )}
              </div>
            </Stack>
          </div>
        ) : (
          <div>
            {features.publicTimeline && !restrictUnauth.timelines.local && <>
              <DropdownNavigationLink
                to='/timeline/local'
                icon={features.federating ? require('@tabler/icons/outline/affiliate.svg') : require('@tabler/icons/outline/world.svg')}
                text={features.federating ? <FormattedMessage id='tabs_bar.local' defaultMessage='Local' /> : <FormattedMessage id='tabs_bar.all' defaultMessage='All' />}
                onClick={closeSidebar}
              />

              {features.bubbleTimeline && !restrictUnauth.timelines.bubble && (
                <DropdownNavigationLink
                  to='/timeline/bubble'
                  icon={require('@tabler/icons/outline/chart-bubble.svg')}
                  text={<FormattedMessage id='tabs_bar.bubble' defaultMessage='Bubble' />}
                  onClick={closeSidebar}
                />
              )}

              {features.federating && !restrictUnauth.timelines.federated && (
                <DropdownNavigationLink
                  to='/timeline/fediverse'
                  icon={require('@tabler/icons/outline/topology-star-ring-3.svg')}
                  text={<FormattedMessage id='tabs_bar.fediverse' defaultMessage='Fediverse' />}
                  onClick={closeSidebar}
                />
              )}

              <Divider />
            </>}

            <DropdownNavigationLink
              to='/login'
              icon={require('@tabler/icons/outline/login.svg')}
              text={intl.formatMessage(messages.login)}
              onClick={closeSidebar}
            />

            {isOpen && (
              <DropdownNavigationLink
                to='/signup'
                icon={require('@tabler/icons/outline/user-plus.svg')}
                text={intl.formatMessage(messages.register)}
                onClick={closeSidebar}
              />
            )}

            <Divider />

            <DropdownNavigationLink
              href={sourceCode.url}
              icon={require('@tabler/icons/outline/code.svg')}
              text={intl.formatMessage(messages.sourceCode)}
              onClick={closeSidebar}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export { DropdownNavigation as default };
