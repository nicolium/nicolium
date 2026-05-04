import React from 'react';

import Account, { type IAccount } from '@/components/accounts/account';
import { useAccount } from '@/queries/accounts/use-account';

import type { LinkOptions } from '@tanstack/react-router';

type IAccountContainer = Omit<IAccount, 'account'> & {
  id: string;
  withRelationship?: boolean;
} & (LinkOptions | {});

const AccountContainer: React.FC<IAccountContainer> = ({ id, withRelationship, ...props }) => {
  const { data: account } = useAccount(id, withRelationship);

  return <Account account={account!} withRelationship={withRelationship} {...props} />;
};

export { AccountContainer as default };
