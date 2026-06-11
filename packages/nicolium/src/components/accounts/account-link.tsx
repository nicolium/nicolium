import { Link } from '@tanstack/react-router';
import React from 'react';

import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { deckColumnRouterRegistry } from '@/pages/deck/components/deck-column-router';

import type { Account, Mention } from 'pl-api';

interface IAccountLink extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  account: Pick<Account, 'acct' | 'url' | 'local'> | Mention;
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
