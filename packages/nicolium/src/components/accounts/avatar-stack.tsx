import clsx from 'clsx';
import React from 'react';

import Avatar from '@/components/ui/avatar';
import { useAccounts } from '@/queries/accounts/use-accounts';

interface IAvatarStack {
  accountIds: Array<string>;
  limit?: number;
}

const AvatarStack: React.FC<IAvatarStack> = ({ accountIds, limit = 3 }) => {
  const dedupAccountIds = React.useMemo(() => [...new Set(accountIds)], [accountIds]);
  const { data: accounts } = useAccounts(dedupAccountIds.slice(0, limit));

  return (
    <div className='relative flex' aria-hidden>
      {accounts.map((account, i) => (
        <div
          className={clsx('relative', { '-ml-3': i !== 0 })}
          key={account.id}
          style={{ zIndex: limit - i }}
        >
          <Avatar
            className='!rounded-full ring-1 ring-white dark:ring-primary-900'
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
