import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import iconSignOut from '@phosphor-icons/core/regular/sign-out.svg';
import { Link, type LinkOptions } from '@tanstack/react-router';
import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Account from '@/components/accounts/account';
import DropdownMenu from '@/components/dropdown-menu';
import PlaceholderAccount from '@/components/placeholders/placeholder-account';
import { useFeatures } from '@/hooks/use-features';
import {
  useLoggedInAccount,
  useLoggedInAccountIds,
} from '@/queries/accounts/use-logged-in-accounts';
import { useAuthActions } from '@/stores/auth';

import ThemeToggle from '../../features/ui/components/theme-toggle';

import type { Account as AccountEntity } from 'pl-api';

const messages = defineMessages({
  openDropdown: { id: 'profile_dropdown.open_dropdown', defaultMessage: 'Open profile dropdown' },
  add: { id: 'profile_dropdown.add_account', defaultMessage: 'Add an existing account' },
  theme: { id: 'profile_dropdown.theme', defaultMessage: 'Theme' },
  logout: { id: 'profile_dropdown.logout', defaultMessage: 'Log out @{acct}' },
});

interface ILoggedInAccount {
  accountId: string;
}

const LoggedInAccount: React.FC<ILoggedInAccount> = ({ accountId }) => {
  const { data: account } = useLoggedInAccount(accountId);

  if (!account) return <PlaceholderAccount />;

  return (
    <Account account={account} showAccountHoverCard={false} withLinkToProfile={false} hideActions />
  );
};

interface IProfileDropdown {
  account: AccountEntity;
  children: React.ReactNode;
}

type IMenuItem = {
  text: string | React.ReactElement | null;
  linkOptions?: LinkOptions;
  toggle?: React.JSX.Element;
  icon?: string;
  action?: (event: React.MouseEvent) => void;
};

const ProfileDropdown: React.FC<IProfileDropdown> = ({ account, children }) => {
  const features = useFeatures();
  const intl = useIntl();
  const { logOut, switchAccountById } = useAuthActions();

  const otherAccountIds = useLoggedInAccountIds();

  const handleLogOut = () => {
    logOut();
  };

  const handleSwitchAccount = (otherAccountId: string) => () => {
    switchAccountById(otherAccountId);
  };

  const renderAccount = (account: AccountEntity) => (
    <Account account={account} showAccountHoverCard={false} withLinkToProfile={false} hideActions />
  );

  const ProfileDropdownMenu = useMemo(() => {
    const menu: IMenuItem[] = [];

    menu.push({
      text: renderAccount(account),
      linkOptions: { to: '/@{$username}', params: { username: account.acct } },
    });

    otherAccountIds.forEach((otherAccountId) => {
      menu.push({
        text: <LoggedInAccount accountId={otherAccountId} />,
        action: handleSwitchAccount(otherAccountId),
      });
    });

    menu.push({ text: null });
    menu.push({ text: intl.formatMessage(messages.theme), toggle: <ThemeToggle /> });
    menu.push({ text: null });

    menu.push({
      text: intl.formatMessage(messages.add),
      linkOptions: { to: '/login/add' },
      icon: iconPlus,
    });

    menu.push({
      text: intl.formatMessage(messages.logout, { acct: account.acct }),
      linkOptions: { to: '/logout' },
      action: handleLogOut,
      icon: iconSignOut,
    });

    return () => (
      <>
        {menu.map((menuItem, i) => (
          <MenuItem key={i} menuItem={menuItem} />
        ))}
      </>
    );
  }, [account, otherAccountIds.length, features]);

  return (
    <DropdownMenu component={ProfileDropdownMenu} className='⁂-profile-dropdown'>
      <button
        className='⁂-profile-dropdown__toggle'
        type='button'
        title={intl.formatMessage(messages.openDropdown)}
        aria-label={intl.formatMessage(messages.openDropdown)}
      >
        {children}
      </button>
    </DropdownMenu>
  );
};

interface MenuItemProps {
  className?: string;
  menuItem: IMenuItem;
}

const MenuItem: React.FC<MenuItemProps> = ({ className, menuItem }) => {
  if (menuItem.toggle) {
    return (
      <label>
        <span>{menuItem.text}</span>

        {menuItem.toggle}
      </label>
    );
  } else if (!menuItem.text) {
    return <hr />;
  } else if (menuItem.action) {
    return (
      <button type='button' onClick={menuItem.action} className={className}>
        {menuItem.text}
      </button>
    );
  } else if (menuItem.linkOptions) {
    return (
      <Link {...menuItem.linkOptions} className={className}>
        {menuItem.text}
      </Link>
    );
  }
};

export { ProfileDropdown as default };
