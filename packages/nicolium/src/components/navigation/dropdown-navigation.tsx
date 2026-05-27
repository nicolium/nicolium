import iconCaretDown from '@phosphor-icons/core/regular/caret-down.svg';
import iconCaretLeft from '@phosphor-icons/core/regular/caret-left.svg';
import iconCode from '@phosphor-icons/core/regular/code.svg';
import iconDotsThreeCircle from '@phosphor-icons/core/regular/dots-three-circle.svg';
import iconNotePencil from '@phosphor-icons/core/regular/note-pencil.svg';
import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import iconSignIn from '@phosphor-icons/core/regular/sign-in.svg';
import iconSignOut from '@phosphor-icons/core/regular/sign-out.svg';
import iconUserPlus from '@phosphor-icons/core/regular/user-plus.svg';
import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

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
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';
import { useIsSidebarOpen, useUiStoreActions } from '@/stores/ui';
import sourceCode from '@/utils/code';

import { AccountLink } from '../accounts/account-link';

import {
  SidebarNavigationAccountLink,
  SidebarNavigationDynamicContentLink,
} from './sidebar-navigation-dynamic-link';
import SidebarNavigationLink from './sidebar-navigation-link';

import type { Account as AccountEntity } from 'pl-api';

const messages = defineMessages({
  back: { id: 'navigation_bar.back', defaultMessage: 'Back' },
});

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
      className='dropdown-navigation__account-switcher__account'
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
    <div className='dropdown-navigation__account-switcher__accounts'>
      {otherAccounts.map((account) => renderAccount(account))}

      <Link
        className='dropdown-navigation__account-switcher__add'
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

const DropdownNavigation: React.FC = React.memo((): React.JSX.Element | null => {
  const intl = useIntl();
  const isSidebarOpen = useIsSidebarOpen();
  const { openModal } = useModalsActions();
  const { closeSidebar } = useUiStoreActions();
  const { verifyAccounts, logOut } = useAuthActions();

  const me = useCurrentAccount();

  const navigationItems = useNavigationItems(false);
  const moreItems = useNavigationItems(undefined, true, true);

  const { data: account } = useAccount(me || undefined);
  const settings = useSettings();
  const touchStart = useRef(0);
  const touchEnd = useRef<number | null>(null);
  const { isOpen } = useRegistrationStatus();

  const containerRef = React.useRef<HTMLDivElement>(null);

  const [sidebarVisible, setSidebarVisible] = useState(isSidebarOpen);
  const [switcher, setSwitcher] = useState(false);
  const [page, setPage] = useState<'main' | 'more'>('main');

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

  const onOpenCompose: React.MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();

    handleClose();

    openModal('COMPOSE', undefined);
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

  const renderNavigationItems = (items: ReturnType<typeof useNavigationItems>) =>
    items
      .filter((item) => item === null || item.type !== 'search-input')
      .map((item, index) => {
        if (item === null) {
          if (index > 0 && items[index - 1] !== null) return <Divider key={`separator-${index}`} />;
          return null;
        }

        switch (item.type) {
          case 'profile-link':
            if (item.ownAccount) {
              if (!account) return null;
              return (
                <React.Fragment key='profile-link'>
                  <AccountLink account={account} onClick={closeSidebar}>
                    <Account
                      account={account}
                      showAccountHoverCard={false}
                      withLinkToProfile={false}
                    />
                  </AccountLink>

                  {!settings.demetricator && (
                    <ProfileStats account={account} onClickHandler={handleClose} />
                  )}
                </React.Fragment>
              );
            } else {
              return (
                <SidebarNavigationAccountLink key={`profile-link:${item.accountId}`} {...item} />
              );
            }
          case 'link':
            return <SidebarNavigationLink {...item} key={item.to} onClick={handleClose} />;
          case 'dynamic-content-link':
            return (
              <SidebarNavigationDynamicContentLink
                key={`${item.contentType}:${item.id}`}
                {...item}
                onClick={handleClose}
              />
            );
          case 'compose':
            return (
              <SidebarNavigationLink
                key='compose'
                icon={iconNotePencil}
                text={<FormattedMessage id='navigation.compose' defaultMessage='Compose' />}
                onClick={onOpenCompose}
              />
            );
          default:
            return null;
        }
      });

  useEffect(() => {
    verifyAccounts();
  }, []);

  useEffect(() => {
    if (isSidebarOpen) containerRef.current?.querySelector('a')?.focus();
    else setPage('main');

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
        'dropdown-navigation__container': true,
        'dropdown-navigation__container--partially-visible': isSidebarOpen || sidebarVisible,
        'dropdown-navigation__container--visible': isSidebarOpen && sidebarVisible,
      })}
      ref={containerRef}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className='dropdown-navigation__overlay' role='button' onClick={handleClose} />

      <div
        className='dropdown-navigation'
        id='dropdown-navigation'
        role='menu'
        data-active-page={page}
      >
        <div className='dropdown-navigation__pages'>
          <div className='dropdown-navigation__page' aria-hidden={page !== 'main'}>
            {renderNavigationItems(navigationItems)}

            {account ? (
              <>
                <Divider />

                <SidebarNavigationLink
                  href={sourceCode.url}
                  icon={iconCode}
                  text={
                    <FormattedMessage id='navigation.source_code' defaultMessage='Source code' />
                  }
                  onClick={closeSidebar}
                />

                <Divider />

                <SidebarNavigationLink
                  to='/logout'
                  icon={iconSignOut}
                  text={<FormattedMessage id='navigation_bar.logout' defaultMessage='Logout' />}
                  onClick={onClickLogOut}
                />

                <SidebarNavigationLink
                  icon={iconDotsThreeCircle}
                  text={<FormattedMessage id='navigation_bar.more' defaultMessage='More' />}
                  onClick={() => setPage('more')}
                />

                <Divider />

                <div
                  className={clsx('dropdown-navigation__account-switcher', {
                    'dropdown-navigation__account-switcher--expanded': switcher,
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
              </>
            ) : (
              <>
                <SidebarNavigationLink
                  to='/login'
                  icon={iconSignIn}
                  text={<FormattedMessage id='account.login' defaultMessage='Log in' />}
                  onClick={closeSidebar}
                />

                <Divider />

                <SidebarNavigationLink
                  href={sourceCode.url}
                  icon={iconCode}
                  text={
                    <FormattedMessage id='navigation.source_code' defaultMessage='Source code' />
                  }
                  onClick={closeSidebar}
                />

                {isOpen && (
                  <SidebarNavigationLink
                    to='/signup'
                    icon={iconUserPlus}
                    text={<FormattedMessage id='account.register' defaultMessage='Sign up' />}
                    onClick={closeSidebar}
                  />
                )}
              </>
            )}
          </div>
          {moreItems.length > 0 && (
            <div className='dropdown-navigation__page' aria-hidden={page !== 'more'}>
              <div className='dropdown-navigation__page__header'>
                <button
                  type='button'
                  onClick={() => setPage('main')}
                  title={intl.formatMessage(messages.back)}
                  aria-label={intl.formatMessage(messages.back)}
                  tabIndex={page === 'more' ? 0 : -1}
                >
                  <Icon src={iconCaretLeft} aria-hidden />
                </button>
                <p>
                  <FormattedMessage id='navigation_bar.more' defaultMessage='More' />
                </p>
              </div>

              {page === 'more' && renderNavigationItems(moreItems)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

DropdownNavigation.displayName = 'DropdownNavigation';

export { DropdownNavigation as default };
