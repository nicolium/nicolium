import iconUserFill from '@phosphor-icons/core/fill/user-fill.svg';
import iconUser from '@phosphor-icons/core/regular/user.svg';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { useAccount } from '@/queries/accounts/use-account';

import SidebarNavigationLink from './sidebar-navigation-link';

import type { NavigationItemsMenuItem } from '@/hooks/use-navigation-items';

const SidebarNavigationAccountLink: React.FC<
  Extract<NavigationItemsMenuItem, { type: 'profile-link' }>
> = ({ accountId, ownAccount }) => {
  const { data: account } = useAccount(accountId);

  if (!account) return null;

  return (
    <SidebarNavigationLink
      to='/@{$username}'
      params={{ username: account?.acct }}
      icon={iconUser}
      activeIcon={iconUserFill}
      text={
        ownAccount ? (
          <FormattedMessage id='tabs_bar.profile' defaultMessage='Profile' />
        ) : (
          `@${account.username}`
        )
      }
    />
  );
};

export { SidebarNavigationAccountLink };
