import { useInfiniteQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Icon from 'pl-fe/components/ui/icon';
import Stack from 'pl-fe/components/ui/stack';
import ComposeButton from 'pl-fe/features/ui/components/compose-button';
import ProfileDropdown from 'pl-fe/features/ui/components/profile-dropdown';
import { useNavigationItemsWithCounts, navigationItemToMenuItem } from 'pl-fe/hooks/use-navigation-items';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import { useRegistrationStatus } from 'pl-fe/hooks/use-registration-status';
import { usePendingUsersCount } from 'pl-fe/queries/admin/use-accounts';
import { usePendingReportsCount } from 'pl-fe/queries/admin/use-reports';
import { scheduledStatusesCountQueryOptions } from 'pl-fe/queries/statuses/scheduled-statuses';
import { useDraftStatusesCountQuery } from 'pl-fe/queries/statuses/use-draft-statuses';
import { useModalsStore } from 'pl-fe/stores/modals';
import { useSettingsStore } from 'pl-fe/stores/settings';
import sourceCode from 'pl-fe/utils/code';
import { getPinnedNavigationItems, navigationMessages } from 'pl-fe/utils/navigation';

import Account from './account';
import DropdownMenu, { Menu } from './dropdown-menu';
import SearchInput from './search-input';
import SidebarNavigationLink from './sidebar-navigation-link';
import SiteLogo from './site-logo';
import Avatar from './ui/avatar';

interface ISidebarNavigation {
  /** Whether the sidebar is in shrinked mode. */
  shrink?: boolean;
}

/** Desktop sidebar with links to different views in the app. */
const SidebarNavigation: React.FC<ISidebarNavigation> = React.memo(({ shrink }) => {
  const intl = useIntl();
  const { openModal } = useModalsStore();
  const { settings } = useSettingsStore();
  const { account } = useOwnAccount();
  const { isOpen } = useRegistrationStatus();

  const authenticatedScheduledStatusesCountQueryOptions = useMemo(() => ({
    ...scheduledStatusesCountQueryOptions,
    enabled: !!account,
  }), [!!account]);

  const { data: awaitingApprovalCount = 0 } = usePendingUsersCount();
  const { data: pendingReportsCount = 0 } = usePendingReportsCount();
  const dashboardCount = pendingReportsCount + awaitingApprovalCount;
  const { data: scheduledStatusCount = 0 } = useInfiniteQuery(authenticatedScheduledStatusesCountQueryOptions);
  const { data: draftCount = 0 } = useDraftStatusesCountQuery();

  // Use the navigation items hook with counts
  const { items: allNavigationItems } = useNavigationItemsWithCounts(
    scheduledStatusCount,
    draftCount,
    dashboardCount,
  );

  // Get pinned navigation items from settings
  const pinnedItems = useMemo(
    () => getPinnedNavigationItems(settings.navigation.items),
    [settings.navigation.items],
  );

  // Get the actual navigation items for pinned items
  const pinnedMenuItems = useMemo(() => {
    return pinnedItems
      .map(({ id }) => allNavigationItems.find(item => item.id === id))
      .filter((item): item is typeof allNavigationItems[number] => {
        return item !== undefined && item.show;
      });
  }, [pinnedItems, allNavigationItems]);

  const menu = useMemo((): Menu => {
    const menu: Menu = [];

    if (account) {
      // Only show items in the dropdown that aren't pinned
      const pinnedIds = pinnedItems.map(item => item.id);
      const dropdownItems = allNavigationItems.filter(
        item => !pinnedIds.includes(item.id) && item.show,
      );
      dropdownItems.forEach(item => menu.push(navigationItemToMenuItem(item)));

      if (menu.length > 0) menu.push(null);

      menu.push({
        icon: require('@phosphor-icons/core/regular/question.svg'),
        text: intl.formatMessage(navigationMessages.help),
        items: [
          {
            action: () => openModal('HOTKEYS'),
            icon: require('@phosphor-icons/core/regular/keyboard.svg'),
            text: intl.formatMessage(navigationMessages.keyboardShortcuts),
          },
          {
            href: sourceCode.url,
            target: '_blank',
            icon: require('@phosphor-icons/core/regular/code.svg'),
            text: intl.formatMessage(navigationMessages.sourceCode),
          },
        ],
      });
    }

    return menu;
  }, [!!account, allNavigationItems, pinnedItems, intl, openModal]);

  return (
    <div className={clsx('⁂-sidebar-navigation', { '⁂-sidebar-navigation--narrow': shrink })}>
      <SiteLogo />

      {account && (
        <Stack space={4}>
          <div className='relative flex items-center'>
            <ProfileDropdown account={account}>
              {shrink ? (
                <Avatar
                  src={account.avatar}
                  alt={account.avatar_description}
                  isCat={account.is_cat}
                  username={account.username}
                  size={40}
                />
              // className='size-10 bg-gray-50 ring-2 ring-white'
              ) : (
                <Account
                  account={account}
                  action={<Icon src={require('@phosphor-icons/core/regular/caret-down.svg')} className='text-gray-600 hover:text-gray-700 dark:text-gray-600 dark:hover:text-gray-500' />}
                  disabled
                  withLinkToProfile={false}
                />
              )}
            </ProfileDropdown>
          </div>
          {!shrink && (
            <div className='block w-full max-w-xs'>
              <SearchInput />
            </div>
          )}
        </Stack>
      )}

      <div className='⁂-sidebar-navigation__links'>
        {/* Render all pinned items */}
        {pinnedMenuItems.map((item) => (
          <SidebarNavigationLink
            key={item.id}
            to={item.to}
            icon={item.icon}
            activeIcon={item.activeIcon}
            count={item.count}
            countMax={item.id === 'chats' ? 9 : undefined}
            text={item.text}
          />
        ))}

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
