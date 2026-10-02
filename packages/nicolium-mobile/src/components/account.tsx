import React from 'react';

import { useAccount } from '@/queries/accounts/use-account';

import { UIAccount } from './statuses/account';

interface IAccount {
  id: string;
}

const Account: React.FC<IAccount> = ({ id }) => {
  const { data: account } = useAccount(id);

  if (!account) return null;

  return (
    <UIAccount avatarSrc={account.avatar} displayName={account.display_name} acct={account.acct} />
  );
};

export { Account };
