import React from 'react';
import { FormattedMessage } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import ScrollableList from '@/components/scrollable-list';
import Modal from '@/components/ui/modal';
import Spinner from '@/components/ui/spinner';
import Emojify from '@/features/emoji/emojify';
import { useAccount } from '@/queries/accounts/use-account';
import { useFamiliarFollowers } from '@/queries/accounts/use-familiar-followers';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

interface FamiliarFollowersModalProps {
  accountId: string;
}

const FamiliarFollowersModal: React.FC<BaseModalProps & FamiliarFollowersModalProps> = ({
  accountId,
  onClose,
}) => {
  const { data: account } = useAccount(accountId);
  const { data: familiarFollowerIds } = useFamiliarFollowers(accountId);

  const onClickClose = () => {
    onClose('FAMILIAR_FOLLOWERS');
  };

  let body;

  if (!account || !familiarFollowerIds) {
    body = <Spinner />;
  } else {
    const emptyMessage = (
      <FormattedMessage
        id='account.familiar_followers.empty'
        defaultMessage='No one you know follows {name}.'
        values={{
          name: (
            <span>
              <Emojify text={account.display_name} emojis={account.emojis} />
            </span>
          ),
        }}
      />
    );

    body = (
      <ScrollableList
        emptyMessageText={emptyMessage}
        itemClassName='pb-3'
        style={{ height: 'calc(80vh - 88px)' }}
        useWindowScroll={false}
      >
        {familiarFollowerIds.map((id) => (
          <AccountContainer key={id} id={id} />
        ))}
      </ScrollableList>
    );
  }

  return (
    <Modal
      title={
        <FormattedMessage
          id='column.familiar_followers'
          defaultMessage='People you know following {name}'
          values={{
            name: !!account && (
              <span>
                <Emojify text={account.display_name} emojis={account.emojis} />
              </span>
            ),
          }}
        />
      }
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export { FamiliarFollowersModal as default, type FamiliarFollowersModalProps };
