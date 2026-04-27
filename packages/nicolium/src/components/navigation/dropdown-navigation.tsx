import iconCaretDown from '@phosphor-icons/core/regular/caret-down.svg';
import iconCode from '@phosphor-icons/core/regular/code.svg';
import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import iconSignIn from '@phosphor-icons/core/regular/sign-in.svg';
import iconSignOut from '@phosphor-icons/core/regular/sign-out.svg';
import iconUserPlus from '@phosphor-icons/core/regular/user-plus.svg';
import { Link, type LinkOptions } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Account from '@/components/accounts/account';
import ProfileStats from '@/components/accounts/profile-stats';
import Divider from '@/components/ui/divider';
import Icon from '@/components/ui/icon';
import Text from '@/components/ui/text';
import { useCurrentAccount } from '@/contexts/current-account-context';
import { useNavigationItems } from '@/hooks/use-navigation-items';
import { useRegistrationStatus } from '@/hooks/use-registration-status';
import { useAccount } from '@/queries/accounts/use-account';
import { useLoggedInAccounts } from '@/queries/accounts/use-logged-in-accounts';
import { useAuthActions } from '@/stores/auth';
import { useSettings } from '@/stores/settings';
import { useIsSidebarOpen, useUiStoreActions } from '@/stores/ui';
import sourceCode from '@/utils/code';

import { AccountLink } from '../accounts/account-link';

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

  const navigationItems = useNavigationItems(false);

  const { data: account } = useAccount(me || undefined);
  const settings = useSettings();
  const [sidebarVisible, setSidebarVisible] = useState(isSidebarOpen);
  const touchStart = useRef(0);
  const touchEnd = useRef<number | null>(null);
  const { isOpen } = useRegistrationStatus();

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

  const renderNavigationItems = () =>
    navigationItems.map((item, index) => {
      if (item === null) return <Divider key={`separator-${index}`} />;

      switch (item.type) {
        case 'compose':
        case 'search-input':
          return null;
        default:
          return <DropdownNavigationLink {...item} key={item.to} onClick={onClickLogOut} />;
      }
    });

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
            <AccountLink account={account} onClick={closeSidebar}>
              <Account account={account} showAccountHoverCard={false} withLinkToProfile={false} />
            </AccountLink>

            {!settings.demetricator && (
              <ProfileStats account={account} onClickHandler={handleClose} />
            )}

            <div className='flex flex-col gap-4'>
              <Divider />

              {renderNavigationItems()}

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
            {renderNavigationItems()}

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
