import React from 'react';
import { FormattedMessage } from 'react-intl';

import ScrollableList from 'pl-fe/components/scrollable-list';
import Modal from 'pl-fe/components/ui/modal';
import Spinner from 'pl-fe/components/ui/spinner';
import AccountContainer from 'pl-fe/containers/account-container';
import Emojify from 'pl-fe/features/emoji/emojify';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFamiliarFollowers } from 'pl-fe/queries/accounts/use-familiar-followers';
import { makeGetAccount } from 'pl-fe/selectors';

import type { BaseModalProps } from 'pl-fe/features/ui/components/modal-root';

const getAccount = makeGetAccount();

interface FamiliarFollowersModalProps {
  accountId: string;
}

const FamiliarFollowersModal: React.FC<BaseModalProps & FamiliarFollowersModalProps> = ({ accountId, onClose }) => {
  const account = useAppSelector(state => getAccount(state, accountId));
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
        values={{ name: <span><Emojify text={account.display_name} emojis={account.emojis} /></span> }}
      />
    );

    body = (
      <ScrollableList
        emptyMessageText={emptyMessage}
        itemClassName='pb-3'
        style={{ height: 'calc(80vh - 88px)' }}
        useWindowScroll={false}
      >
        {familiarFollowerIds.map(id =>
          <AccountContainer key={id} id={id} />,
        )}
      </ScrollableList>
    );
  }

  return (
    <Modal
      title={
        <FormattedMessage
          id='column.familiar_followers'
          defaultMessage='People you know following {name}'
          values={{ name: !!account && <span><Emojify text={account.display_name} emojis={account.emojis} /></span> }}
        />
      }
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export { FamiliarFollowersModal as default, type FamiliarFollowersModalProps };
