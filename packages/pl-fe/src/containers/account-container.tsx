import React from 'react';

import Account, { type IAccount } from '@/components/account';
import { useAccount } from '@/queries/accounts/use-account';

interface IAccountContainer extends Omit<IAccount, 'account'> {
  id: string;
  withRelationship?: boolean;
}

const AccountContainer: React.FC<IAccountContainer> = ({ id, withRelationship, ...props }) => {
  const { data: account } = useAccount(id, withRelationship);

  return <Account account={account!} withRelationship={withRelationship} {...props} />;
};

export { AccountContainer as default };
