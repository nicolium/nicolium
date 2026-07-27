import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import iconSignOut from '@phosphor-icons/core/regular/sign-out.svg';
import { Link, type LinkOptions } from '@tanstack/react-router';
import { clsx } from 'clsx';
import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Account from '@/components/accounts/account';
import DropdownMenu from '@/components/dropdown-menu';
import PlaceholderAccount from '@/components/placeholders/placeholder-account';
import { CurrentAccountProvider } from '@/contexts/current-account-context';
import { useAccountSwitcher } from '@/hooks/use-account-switcher';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useNotificationsUnreadCount } from '@/queries/notifications/use-notifications';
import { useAuthActions } from '@/stores/auth';
import { useSettings } from '@/stores/settings';

import ThemeToggle from '../settings/theme-toggle';
import Counter from '../ui/counter';

import type { Account as AccountEntity } from 'pl-api';

const messages = defineMessages({
  openDropdown: { id: 'profile_dropdown.open_dropdown', defaultMessage: 'Open profile dropdown' },
  add: { id: 'profile_dropdown.add_account', defaultMessage: 'Add an existing account' },
  theme: { id: 'profile_dropdown.theme', defaultMessage: 'Theme' },
  logout: { id: 'profile_dropdown.logout', defaultMessage: 'Log out @{acct}' },
});

const LoggedInAccount: React.FC = () => {
  const { data: account } = useOwnAccount();
  const unreadCount = useNotificationsUnreadCount();
  const { demetricator } = useSettings();

  if (!account) return <PlaceholderAccount />;

  return (
    <Account
      account={account}
      showAccountHoverCard={false}
      withLinkToProfile={false}
      action={
        unreadCount ? (
          <Counter count={unreadCount} countMax={demetricator !== 'off' ? 1 : undefined} />
        ) : (
          <></>
        )
      }
    />
  );
};

interface ISwitcherAccount {
  accountUrl: string;
  switcher: ReturnType<typeof useAccountSwitcher>;
}

const SwitcherAccount: React.FC<ISwitcherAccount> = ({ accountUrl, switcher }) => (
  <div
    className={clsx('profile-dropdown__account', {
      'profile-dropdown__account--dragging': switcher.draggedUrl === accountUrl,
    })}
    {...switcher.getDragProps(accountUrl)}
  >
    <button
      type='button'
      className='profile-dropdown__account__switch'
      onClick={() => {
        switcher.handleSwitch(accountUrl);
      }}
    >
      <LoggedInAccount />
    </button>
  </div>
);

const SwitcherAccounts: React.FC = () => {
  const switcher = useAccountSwitcher();

  if (!switcher.accountUrls.length) return null;

  return (
    <div className='profile-dropdown__accounts'>
      {switcher.accountUrls.map((accountUrl) => (
        <CurrentAccountProvider key={accountUrl} accountUrl={accountUrl}>
          <SwitcherAccount accountUrl={accountUrl} switcher={switcher} />
        </CurrentAccountProvider>
      ))}
    </div>
  );
};

type IMenuItem = {
  text?: string | React.ReactElement | null;
  node?: React.ReactNode;
  linkOptions?: LinkOptions;
  toggle?: React.JSX.Element;
  icon?: string;
  action?: (event: React.MouseEvent) => void;
};

interface IProfileDropdown {
  account: AccountEntity;
  children?: React.ReactNode;
}

const ProfileDropdown: React.FC<IProfileDropdown> = ({ account, children }) => {
  const features = useFeatures();
  const intl = useIntl();
  const { logOut } = useAuthActions();

  const handleLogOut = () => {
    logOut();
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

    menu.push({ node: <SwitcherAccounts /> });

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
  }, [account, features]);

  return (
    <DropdownMenu component={ProfileDropdownMenu} className='profile-dropdown'>
      <button
        className='profile-dropdown__toggle'
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
  if (menuItem.node) {
    return menuItem.node;
  } else if (menuItem.toggle) {
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
