import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import IconButton from 'pl-fe/components/icon-button';
import HStack from 'pl-fe/components/ui/hstack';
import AccountContainer from 'pl-fe/containers/account-container';
import { useAddAccountsToList, useRemoveAccountsFromList } from 'pl-fe/queries/accounts/use-lists';

const messages = defineMessages({
  remove: { id: 'lists.account.remove', defaultMessage: 'Remove from list' },
  add: { id: 'lists.account.add', defaultMessage: 'Add to list' },
});

interface IAccount {
  listId: string;
  accountId: string;
  added?: boolean;
}

const Account: React.FC<IAccount> = ({ listId, accountId, added }) => {
  const intl = useIntl();

  const { mutate: addToList } = useAddAccountsToList(listId);
  const { mutate: removeFromList } = useRemoveAccountsFromList(listId);

  const onAdd = () => addToList([accountId]);
  const onRemove = () => removeFromList([accountId]);

  let button;

  if (added) {
    button = <IconButton src={require('@tabler/icons/outline/x.svg')} iconClassName='h-5 w-5' title={intl.formatMessage(messages.remove)} onClick={onRemove} />;
  } else {
    button = <IconButton src={require('@tabler/icons/outline/plus.svg')} iconClassName='h-5 w-5' title={intl.formatMessage(messages.add)} onClick={onAdd} />;
  }

  return (
    <HStack space={1} alignItems='center' justifyContent='between' className='p-2.5'>
      <div className='w-full'>
        <AccountContainer id={accountId} withRelationship={false} />
      </div>
      {button}
    </HStack>
  );
};

export { Account as default };
