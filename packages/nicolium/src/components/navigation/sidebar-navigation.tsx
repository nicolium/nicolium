import iconSignInFill from '@phosphor-icons/core/fill/sign-in-fill.svg';
import iconUserPlusFill from '@phosphor-icons/core/fill/user-plus-fill.svg';
import iconBookOpen from '@phosphor-icons/core/regular/book-open.svg';
import iconCaretDown from '@phosphor-icons/core/regular/caret-down.svg';
import iconCode from '@phosphor-icons/core/regular/code.svg';
import iconDotsThreeCircle from '@phosphor-icons/core/regular/dots-three-circle.svg';
import iconKeyboard from '@phosphor-icons/core/regular/keyboard.svg';
import iconQuestion from '@phosphor-icons/core/regular/question.svg';
import iconSignIn from '@phosphor-icons/core/regular/sign-in.svg';
import iconUserPlus from '@phosphor-icons/core/regular/user-plus.svg';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import ComposeButton from '@/components/navigation/compose-button';
import ProfileDropdown from '@/components/navigation/profile-dropdown';
import Icon from '@/components/ui/icon';
import { useNavigationItems } from '@/hooks/use-navigation-items';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useRegistrationStatus } from '@/hooks/use-registration-status';
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

  const { data: account } = useOwnAccount();
  const { isOpen } = useRegistrationStatus();

  const navigationItems = useNavigationItems();
  const menuItems = useNavigationItems(undefined, true);

  const menu = useMemo((): Menu => {
    const menu: Menu = [];

    if (account) {
      for (const item of menuItems) {
        if (item === null) {
          menu.push(null);
          continue;
        }

        switch (item.type) {
          case 'compose':
          case 'search-input':
            break;
          default: {
            const { type, ...rest } = item;
            menu.push(rest);
          }
        }
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
  }, [menuItems, intl.locale]);

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
        {navigationItems.map((item, index) => {
          if (item === null) return <hr key={`separator-${index}`} />;

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
              return (
                <li key={item.to}>
                  <SidebarNavigationLink {...item} />
                </li>
              );
          }
        })}

        {menu.length > 0 && (
          <DropdownMenu items={menu} placement='top' width='16rem'>
            <li>
              <SidebarNavigationLink
                icon={iconDotsThreeCircle}
                text={<FormattedMessage id='tabs_bar.more' defaultMessage='More' />}
              />
            </li>
          </DropdownMenu>
        )}

        {!account && (
          <div className='flex flex-col gap-1.5 xl:hidden'>
            <li>
              <SidebarNavigationLink
                to='/login'
                icon={iconSignIn}
                activeIcon={iconSignInFill}
                text={<FormattedMessage id='account.login' defaultMessage='Log in' />}
              />
            </li>

            {isOpen && (
              <li>
                <SidebarNavigationLink
                  to='/signup'
                  icon={iconUserPlus}
                  activeIcon={iconUserPlusFill}
                  text={<FormattedMessage id='account.register' defaultMessage='Sign up' />}
                />
              </li>
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
