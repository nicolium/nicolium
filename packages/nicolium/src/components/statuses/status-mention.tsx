import React from 'react';

import { useAccount } from '@/queries/accounts/use-account';
import { useSettings } from '@/stores/settings';

import { AccountLink } from '../accounts/account-link';
import HoverAccountWrapper from '../accounts/hover-account-wrapper';
import { MentionWithAvatar } from '../accounts/mention-with-avatar';

interface IStatusMention {
  accountId: string;
  fallback?: React.JSX.Element;
}

const StatusMention: React.FC<IStatusMention> = ({ accountId, fallback }) => {
  const { data: account } = useAccount(accountId);

  const { displayMentionAvatars } = useSettings();

  if (!account)
    return (
      <HoverAccountWrapper accountId={accountId} element='span'>
        {fallback}
      </HoverAccountWrapper>
    );

  return (
    <AccountLink
      account={account}
      dir='ltr'
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {displayMentionAvatars ? (
        <MentionWithAvatar id={accountId} username={account.acct} />
      ) : (
        <HoverAccountWrapper accountId={accountId} element='span'>
          @{account.acct}
        </HoverAccountWrapper>
      )}
    </AccountLink>
  );
};

export { StatusMention as default };
