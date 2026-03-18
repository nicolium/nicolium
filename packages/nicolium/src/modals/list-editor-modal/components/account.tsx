import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import IconButton from '@/components/ui/icon-button';

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
    button = (
      <IconButton
        src={iconX}
        className='text-gray-400 hover:text-gray-600'
        iconClassName='h-5 w-5'
        title={intl.formatMessage(messages.remove)}
        onClick={() => {
          onRemove(accountId);
        }}
      />
    );
  } else {
    button = (
      <IconButton
        src={iconPlus}
        className='text-gray-400 hover:text-gray-600'
        iconClassName='h-5 w-5'
        title={intl.formatMessage(messages.add)}
        onClick={() => {
          onAdd(accountId);
        }}
      />
    );
  }

  return (
    <div className='flex items-center justify-between gap-1 p-2.5'>
      <div className='w-full'>
        <AccountContainer id={accountId} withRelationship={false} />
      </div>
      {button}
    </div>
  );
};

export { Account as default };
