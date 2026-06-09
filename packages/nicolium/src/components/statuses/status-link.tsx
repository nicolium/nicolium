import { Link } from '@tanstack/react-router';
import React from 'react';

import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { deckColumnRouterRegistry } from '@/pages/deck/components/deck-column';

import type { Account, Status } from 'pl-api';

interface IStatusLink extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  status: Pick<Status, 'id' | 'url'>;
  account: Pick<Account, 'acct' | 'local'>;
  columnId?: string;
}

const StatusLink: React.FC<IStatusLink> = ({ status, account, columnId, ...props }) => {
  const { isLoggedIn } = useLoggedIn();
  const { allowDisplayingRemoteNoLogin } = useFrontendConfig();

  const local = 'local' in account ? account.local : !account.acct.includes('@');

  if (!isLoggedIn && !local && !allowDisplayingRemoteNoLogin) {
    return (
      <a href={status.url} {...props} target='_blank' rel='noopener noreferrer'>
        {props.children}
      </a>
    );
  }

  const handleClick = columnId
    ? (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        e.stopPropagation();
        deckColumnRouterRegistry.get(columnId)?.router.navigate({
          to: '/@{$username}/posts/$statusId',
          params: { username: account.acct, statusId: status.id },
        });
      }
    : undefined;

  return (
    <Link
      to='/@{$username}/posts/$statusId'
      params={{ username: account.acct, statusId: status.id }}
      onClick={handleClick}
      {...props}
    />
  );
};

export { StatusLink };
