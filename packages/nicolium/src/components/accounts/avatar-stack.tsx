import React from 'react';

import Avatar from '@/components/ui/avatar';
import { useAccounts } from '@/queries/accounts/use-accounts';

interface IAvatarStack {
  accountIds: Array<string>;
  limit?: number;
}

const AvatarStack: React.FC<IAvatarStack> = ({ accountIds, limit = 3 }) => {
  const dedupAccountIds = React.useMemo(
    () => [...new Set(accountIds)].slice(0, limit),
    [accountIds],
  );

  const { data: accounts } = useAccounts(dedupAccountIds);

  return (
    <div className='avatar-stack' aria-hidden>
      {accounts.map((account, i) => (
        <div key={account.id} style={{ zIndex: limit - i }}>
          <Avatar
            src={account.avatar}
            alt={account.avatar_description}
            size={20}
            isCat={account.is_cat}
            username={account.username}
          />
        </div>
      ))}
    </div>
  );
};

export { AvatarStack as default };
