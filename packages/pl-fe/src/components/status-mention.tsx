import { Link } from '@tanstack/react-router';
import React from 'react';

import { useAccount } from '@/api/hooks/accounts/use-account';

import HoverAccountWrapper from './hover-account-wrapper';

interface IStatusMention {
  accountId: string;
  fallback?: JSX.Element;
}

const StatusMention: React.FC<IStatusMention> = ({ accountId, fallback }) => {
  const { account } = useAccount(accountId);

  if (!account) return (
    <HoverAccountWrapper accountId={accountId} element='span'>
      {fallback}
    </HoverAccountWrapper>
  );

  return (
    <Link
      to='/@{$username}'
      params={{ username: account.acct }}
      className='text-primary-600 hover:underline dark:text-primary-400'
      dir='ltr'
      onClick={(e) =>{
        e.stopPropagation();
      }}
    >
      <HoverAccountWrapper accountId={accountId} element='span'>
        @{account.acct}
      </HoverAccountWrapper>
    </Link>
  );
};

export { StatusMention as default };
