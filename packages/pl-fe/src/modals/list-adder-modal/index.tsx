import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { CardHeader, CardTitle } from 'pl-fe/components/ui/card';
import Modal from 'pl-fe/components/ui/modal';
import AccountContainer from 'pl-fe/containers/account-container';
import { NewListForm, getOrderedLists } from 'pl-fe/pages/account-lists/lists';
import { useLists, useListsForAccount } from 'pl-fe/queries/accounts/use-lists';

import List from './components/list';

import type { BaseModalProps } from 'pl-fe/features/ui/components/modal-root';

const messages = defineMessages({
  subheading: { id: 'lists.subheading', defaultMessage: 'Your lists' },
  add: { id: 'lists.new.create', defaultMessage: 'Add list' },
});

interface ListAdderModalProps {
  accountId: string;
}

const ListAdderModal: React.FC<BaseModalProps & ListAdderModalProps> = ({ accountId, onClose }) => {
  const intl = useIntl();

  const { data: accountListIds = [] } = useListsForAccount(accountId);

  const { data: listIds = [] } = useLists((lists) => getOrderedLists(lists).map(list => list.id));

  const onClickClose = () => {
    onClose('LIST_ADDER');
  };

  return (
    <Modal
      title={<FormattedMessage id='list_adder.header_title' defaultMessage='Add or remove from lists' />}
      onClose={onClickClose}
    >
      <AccountContainer id={accountId} withRelationship={false} />

      <br />

      <CardHeader>
        <CardTitle title={intl.formatMessage(messages.add)} />
      </CardHeader>
      <NewListForm />

      <br />

      <CardHeader>
        <CardTitle title={intl.formatMessage(messages.subheading)} />
      </CardHeader>
      <div>
        {listIds.map(listId => <List key={listId} accountId={accountId} listId={listId} added={accountListIds.includes(listId)} />)}
      </div>
    </Modal>
  );
};

export { type ListAdderModalProps, ListAdderModal as default };
