import React from 'react';
import { FormattedList, FormattedMessage } from 'react-intl';

import AvatarStack from '@/components/accounts/avatar-stack';
import HoverAccountWrapper from '@/components/accounts/hover-account-wrapper';
import VerificationBadge from '@/components/accounts/verification-badge';
import Emojify from '@/features/emoji/emojify';
import { useAccount } from '@/queries/accounts/use-account';
import { useFamiliarFollowers } from '@/queries/accounts/use-familiar-followers';
import { useModalsActions } from '@/stores/modals';

import { AccountLink } from './account-link';

import type { Account } from 'pl-api';

interface IFamiliarFollowerLink {
  id: string;
}

const FamiliarFollowerLink: React.FC<IFamiliarFollowerLink> = ({ id }) => {
  const { data: account } = useAccount(id);

  if (!account) return null;

  return (
    <AccountLink className='mention inline-block' account={account} key={account.id}>
      <HoverAccountWrapper accountId={account.id} element='span'>
        <p>
          <Emojify text={account.display_name} emojis={account.emojis} />
        </p>

        {account.verified && <VerificationBadge />}
      </HoverAccountWrapper>
    </AccountLink>
  );
};

interface IProfileFamiliarFollowers {
  account: Account;
}

const ProfileFamiliarFollowers: React.FC<IProfileFamiliarFollowers> = ({ account }) => {
  const { openModal } = useModalsActions();
  const { data: familiarFollowerIds = [] } = useFamiliarFollowers(account.id);
  const displayedFamiliarFollowerIds = familiarFollowerIds.slice(0, 2);

  const openFamiliarFollowersModal = () => {
    openModal('FAMILIAR_FOLLOWERS', {
      accountId: account.id,
    });
  };

  if (familiarFollowerIds.length === 0) {
    return null;
  }

  const accounts: Array<React.ReactNode> = displayedFamiliarFollowerIds.map((accountId) => (
    <FamiliarFollowerLink id={accountId} key={accountId} />
  ));

  if (familiarFollowerIds.length > 2) {
    accounts.push(
      <span key='_' role='presentation' onClick={openFamiliarFollowersModal}>
        <FormattedMessage
          id='account.familiar_followers.more'
          defaultMessage='{count, plural, one {# other} other {# others}} you follow'
          values={{ count: familiarFollowerIds.length - displayedFamiliarFollowerIds.length }}
        />
      </span>,
    );
  }

  return (
    <div className='⁂-familiar-followers'>
      <AvatarStack accountIds={familiarFollowerIds} />
      <p>
        <FormattedMessage
          id='account.familiar_followers'
          defaultMessage='Followed by {accounts}'
          values={{
            accounts: <FormattedList type='conjunction' value={accounts} />,
          }}
        />
      </p>
    </div>
  );
};

export { ProfileFamiliarFollowers as default };
