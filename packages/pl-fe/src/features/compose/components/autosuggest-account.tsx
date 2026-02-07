import React from 'react';

import { useAccount } from '@/api/hooks/accounts/use-account';
import Account from '@/components/account';

interface IAutosuggestAccount {
  id: string;
}

const AutosuggestAccount: React.FC<IAutosuggestAccount> = ({ id }) => {
  const { account } = useAccount(id);
  if (!account) return null;

  return (
    <div className='snap-start snap-always'>
      <Account account={account} hideActions showAccountHoverCard={false} disabled />
    </div>
  );

};

export { AutosuggestAccount as default };
