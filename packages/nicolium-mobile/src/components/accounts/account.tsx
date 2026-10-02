import React from 'react';

import { useAccount } from '@/queries/accounts/use-account';

import { UIAccount } from '../ui/account';

interface IAccount {
  id: string;
  timestamp?: string;
}

const Account: React.FC<IAccount> = ({ id, ...props }) => {
  const { data: account } = useAccount(id);

  if (!account) return null;

  return (
    <UIAccount
      avatarSrc={account.avatar}
      displayName={account.display_name}
      acct={account.acct}
      {...props}
    />
  );
};

export { Account };
