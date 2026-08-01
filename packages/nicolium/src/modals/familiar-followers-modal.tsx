import React from 'react';
import { FormattedMessage } from 'react-intl';

import AccountList from '@/components/accounts/account-list';
import Modal from '@/components/ui/modal';
import Emojify from '@/emoji/emojify';
import { useAccount } from '@/queries/accounts/use-account';
import { useFamiliarFollowers } from '@/queries/accounts/use-familiar-followers';

import type { BaseModalProps } from '@/modals/modal-root';

interface FamiliarFollowersModalProps {
  accountId: string;
}

const FamiliarFollowersModal: React.FC<BaseModalProps & FamiliarFollowersModalProps> = ({
  accountId,
  onClose,
}) => {
  const { data: account } = useAccount(accountId);
  const { data: familiarFollowerIds } = useFamiliarFollowers(accountId);

  const displayName = !!account && (
    <span>
      <Emojify text={account.display_name} emojis={account.emojis} />
    </span>
  );

  return (
    <Modal
      title={
        <FormattedMessage
          id='column.familiar_followers'
          defaultMessage='People you know following {name}'
          values={{ name: displayName }}
        />
      }
      onClose={() => onClose('FAMILIAR_FOLLOWERS')}
    >
      <AccountList
        accountIds={account && familiarFollowerIds}
        emptyMessage={
          <FormattedMessage
            id='account.familiar_followers.empty'
            defaultMessage='No one you know follows {name}.'
            values={{ name: displayName }}
          />
        }
      />
    </Modal>
  );
};

export { FamiliarFollowersModal as default, type FamiliarFollowersModalProps };
