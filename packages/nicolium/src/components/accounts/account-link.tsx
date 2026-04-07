import { Link } from '@tanstack/react-router';
import React from 'react';

import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useLoggedIn } from '@/hooks/use-logged-in';

import type { Account, Mention } from 'pl-api';

interface IAccountLink extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  account: Account | Mention;
}

const AccountLink: React.FC<IAccountLink> = ({ account, ...props }) => {
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

  return (
    <Link to='/@{$username}' params={{ username: account.acct }} title={account.acct} {...props} />
  );
};

export { AccountLink };
