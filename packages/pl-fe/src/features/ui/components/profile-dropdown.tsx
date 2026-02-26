import { Link, type LinkOptions } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { logOut, switchAccount } from '@/actions/auth';
import Account from '@/components/account';
import DropdownMenu from '@/components/dropdown-menu';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedInAccounts } from '@/queries/accounts/use-logged-in-accounts';

import ThemeToggle from './theme-toggle';

import type { Account as AccountEntity } from 'pl-api';

const messages = defineMessages({
  add: { id: 'profile_dropdown.add_account', defaultMessage: 'Add an existing account' },
  theme: { id: 'profile_dropdown.theme', defaultMessage: 'Theme' },
  logout: { id: 'profile_dropdown.logout', defaultMessage: 'Log out @{acct}' },
});

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
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const intl = useIntl();

  const { accounts: otherAccounts } = useLoggedInAccounts();

  const handleLogOut = () => {
    dispatch(logOut());
  };

  const handleSwitchAccount = (otherAccount: AccountEntity) => () => {
    dispatch(switchAccount(otherAccount.id));
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

    otherAccounts.forEach((otherAccount?: AccountEntity) => {
      if (otherAccount && otherAccount.id !== account.id) {
        menu.push({
          text: renderAccount(otherAccount),
          action: handleSwitchAccount(otherAccount),
        });
      }
    });

    menu.push({ text: null });
    menu.push({ text: intl.formatMessage(messages.theme), toggle: <ThemeToggle /> });
    menu.push({ text: null });

    menu.push({
      text: intl.formatMessage(messages.add),
      linkOptions: { to: '/login/add' },
      icon: require('@phosphor-icons/core/regular/plus.svg'),
    });

    menu.push({
      text: intl.formatMessage(messages.logout, { acct: account.acct }),
      linkOptions: { to: '/logout' },
      action: handleLogOut,
      icon: require('@phosphor-icons/core/regular/sign-out.svg'),
    });

    return () => (
      <>
        {menu.map((menuItem, i) => (
          <MenuItem key={i} menuItem={menuItem} />
        ))}
      </>
    );
  }, [account, otherAccounts.length, features]);

  return (
    <DropdownMenu component={ProfileDropdownMenu}>
      <button
        className='w-full rounded-lg focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:ring-gray-800 dark:ring-offset-0 dark:focus:ring-primary-500'
        type='button'
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
  const baseClassName = clsx(
    className,
    'block w-full cursor-pointer truncate px-4 py-2.5 text-left text-sm text-gray-700 outline-none hover:bg-gray-100 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:text-gray-500 dark:hover:bg-gray-800 dark:focus:ring-offset-0 rtl:text-right',
  );

  if (menuItem.toggle) {
    return (
      <label className='flex flex-row items-center justify-between space-x-4 px-4 py-1 text-sm text-gray-700 dark:text-gray-400'>
        <span>{menuItem.text}</span>

        {menuItem.toggle}
      </label>
    );
  } else if (!menuItem.text) {
    return (
      <hr className='mx-2 my-1 border-t-2 border-gray-100 black:border-t dark:border-gray-800' />
    );
  } else if (menuItem.action) {
    return (
      <button type='button' onClick={menuItem.action} className={baseClassName}>
        {menuItem.text}
      </button>
    );
  } else if (menuItem.linkOptions) {
    return (
      <Link {...menuItem.linkOptions} className={baseClassName}>
        {menuItem.text}
      </Link>
    );
  } else {
    throw menuItem;
  }
};

export { ProfileDropdown as default };
