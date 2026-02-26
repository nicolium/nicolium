import React from 'react';

import { Link } from '@/components/link';
import { useAccount } from '@/queries/accounts/use-account';

import HoverAccountWrapper from '../accounts/hover-account-wrapper';

interface IStatusMention {
  accountId: string;
  fallback?: React.JSX.Element;
}

const StatusMention: React.FC<IStatusMention> = ({ accountId, fallback }) => {
  const { data: account } = useAccount(accountId);

  if (!account)
    return (
      <HoverAccountWrapper accountId={accountId} element='span'>
        {fallback}
      </HoverAccountWrapper>
    );

  return (
    <Link
      to='/@{$username}'
      params={{ username: account.acct }}
      dir='ltr'
      onClick={(e) => {
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
