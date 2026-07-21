import { Link } from '@tanstack/react-router';
import React from 'react';

import { deckColumnRouterRegistry } from '@/contexts/deck-column-id-context';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useLoggedIn } from '@/hooks/use-logged-in';

import type { Account, Mention } from 'pl-api';

interface IAccountLink extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  account: Pick<Account, 'acct' | 'url' | 'local'> | Mention;
  /**
   * ID of the column rendering the account link.
   * Used by AccountHoverCard for consistent navigation.
   */
  columnId?: string;
}

const AccountLink: React.FC<IAccountLink> = ({ account, columnId, ...props }) => {
  const { isLoggedIn } = useLoggedIn();
  const { allowDisplayingRemoteNoLogin } = useFrontendConfig();

  const local = 'local' in account ? account.local : !account.acct.includes('@');

  if (!isLoggedIn && !local && !allowDisplayingRemoteNoLogin) {
    return (
      <a
        href={account.url}
        title={account.acct}
        {...props}
        target='_blank'
        rel='noopener noreferrer'
      />
    );
  }

  const handleClick = columnId
    ? (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        e.stopPropagation();
        deckColumnRouterRegistry
          .get(columnId)
          ?.router.navigate({ to: '/@{$username}', params: { username: account.acct } });
      }
    : undefined;

  return (
    <Link
      to='/@{$username}'
      params={{ username: account.acct }}
      title={account.acct}
      onClick={handleClick}
      {...props}
    />
  );
};

export { AccountLink };
