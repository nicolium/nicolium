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

  const pronouns = account.pronouns.length
    ? account.pronouns.join('/')
    : account.fields.find(
        ({ name, value }) =>
          name.toLocaleLowerCase().includes('pronouns') &&
          value.length <= 24 &&
          !value.startsWith('<'),
      );

  return (
    <UIAccount
      avatarSrc={account.avatar}
      displayName={account.display_name}
      displayNameDetail={pronouns?.value}
      acct={account.acct}
      {...props}
    />
  );
};

export { Account };
