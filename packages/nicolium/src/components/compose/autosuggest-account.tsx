import React from 'react';

import Account from '@/components/accounts/account';
import { useAccount } from '@/queries/accounts/use-account';

interface IAutosuggestAccount {
  id: string;
}

const AutosuggestAccount: React.FC<IAutosuggestAccount> = ({ id }) => {
  const { data: account } = useAccount(id);
  if (!account) return null;

  return (
    <div className='autosuggest-account'>
      <Account account={account} hideActions showAccountHoverCard={false} disabled />
    </div>
  );
};

export { AutosuggestAccount as default };
