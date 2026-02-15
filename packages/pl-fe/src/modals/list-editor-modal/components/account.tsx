import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import HStack from '@/components/ui/hstack';
import IconButton from '@/components/ui/icon-button';
import AccountContainer from '@/containers/account-container';

const messages = defineMessages({
  remove: { id: 'lists.account.remove', defaultMessage: 'Remove from list' },
  add: { id: 'lists.account.add', defaultMessage: 'Add to list' },
});

interface IAccount {
  accountId: string;
  added?: boolean;
  onAdd: (accountId: string) => void;
  onRemove: (accountId: string) => void;
}

const Account: React.FC<IAccount> = ({ accountId, added, onAdd, onRemove }) => {
  const intl = useIntl();

  let button;

  if (added) {
    button = (<IconButton
      src={require('@phosphor-icons/core/regular/x.svg')} className='text-gray-400 hover:text-gray-600' iconClassName='h-5 w-5' title={intl.formatMessage(messages.remove)} onClick={() =>{
        onRemove(accountId);
      }}
    />);
  } else {
    button = (<IconButton
      src={require('@phosphor-icons/core/regular/plus.svg')} className='text-gray-400 hover:text-gray-600' iconClassName='h-5 w-5' title={intl.formatMessage(messages.add)} onClick={() =>{
        onAdd(accountId);
      }}
    />);
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
