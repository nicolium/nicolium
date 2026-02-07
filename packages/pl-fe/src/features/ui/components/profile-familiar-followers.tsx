import { Link } from '@tanstack/react-router';
import React from 'react';
import { FormattedList, FormattedMessage } from 'react-intl';

import { useAccount } from '@/api/hooks/accounts/use-account';
import AvatarStack from '@/components/avatar-stack';
import HoverAccountWrapper from '@/components/hover-account-wrapper';
import HStack from '@/components/ui/hstack';
import Text from '@/components/ui/text';
import VerificationBadge from '@/components/verification-badge';
import Emojify from '@/features/emoji/emojify';
import { useFamiliarFollowers } from '@/queries/accounts/use-familiar-followers';
import { useModalsActions } from '@/stores/modals';

import type { Account } from 'pl-api';

interface IFamiliarFollowerLink {
  id: string;
}

const FamiliarFollowerLink: React.FC<IFamiliarFollowerLink> = ({ id }) => {
  const { account } = useAccount(id);

  if (!account) return null;

  return (
    <Link className='mention inline-block' to='/@{$username}' params={{ username: account.acct }} key={account.id}>
      <HoverAccountWrapper accountId={account.id} element='span'>
        <HStack space={1} alignItems='center' grow>
          <Text size='sm' theme='primary' truncate>
            <Emojify text={account.display_name} emojis={account.emojis} />
          </Text>

          {account.verified && <VerificationBadge />}
        </HStack>
      </HoverAccountWrapper>
    </Link>
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

  const accounts: Array<React.ReactNode> = displayedFamiliarFollowerIds.map(accountId => (
    <FamiliarFollowerLink id={accountId} key={accountId} />
  ));

  if (familiarFollowerIds.length > 2) {
    accounts.push(
      <span key='_' className='cursor-pointer hover:underline' role='presentation' onClick={openFamiliarFollowersModal}>
        <FormattedMessage
          id='account.familiar_followers.more'
          defaultMessage='{count, plural, one {# other} other {# others}} you follow'
          values={{ count: familiarFollowerIds.length - displayedFamiliarFollowerIds.length }}
        />
      </span>,
    );
  }

  return (
    <HStack space={2} alignItems='center'>
      <AvatarStack accountIds={familiarFollowerIds} />
      <Text theme='muted' size='sm' tag='div'>
        <FormattedMessage
          id='account.familiar_followers'
          defaultMessage='Followed by {accounts}'
          values={{
            accounts: <FormattedList type='conjunction' value={accounts} />,
          }}
        />
      </Text>
    </HStack>
  );
};

export { ProfileFamiliarFollowers as default };
