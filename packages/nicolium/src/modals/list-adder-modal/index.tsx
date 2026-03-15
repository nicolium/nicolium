import React from 'react';
import { FormattedMessage } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import { CardHeader, CardTitle } from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { NewListForm, getOrderedLists } from '@/pages/account-lists/lists';
import { useLists, useListsForAccount } from '@/queries/accounts/use-lists';

import List from './components/list';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

interface ListAdderModalProps {
  accountId: string;
}

const ListAdderModal: React.FC<BaseModalProps & ListAdderModalProps> = ({ accountId, onClose }) => {
  const { data: accountListIds = [] } = useListsForAccount(accountId);

  const { data: listIds = [] } = useLists((lists) => getOrderedLists(lists).map((list) => list.id));

  const onClickClose = () => {
    onClose('LIST_ADDER');
  };

  return (
    <Modal
      title={
        <FormattedMessage id='list_adder.header_title' defaultMessage='Add or remove from lists' />
      }
      onClose={onClickClose}
    >
      <AccountContainer id={accountId} withRelationship={false} />

      <br />

      <CardHeader>
        <CardTitle title={<FormattedMessage id='lists.new.create' defaultMessage='Add list' />} />
      </CardHeader>
      <NewListForm />

      <br />

      <CardHeader>
        <CardTitle title={<FormattedMessage id='lists.subheading' defaultMessage='Your lists' />} />
      </CardHeader>
      <div>
        {listIds.map((listId) => (
          <List
            key={listId}
            accountId={accountId}
            listId={listId}
            added={accountListIds.includes(listId)}
          />
        ))}
      </div>
    </Modal>
  );
};

export { type ListAdderModalProps, ListAdderModal as default };
