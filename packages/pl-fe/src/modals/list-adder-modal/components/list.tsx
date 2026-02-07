import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Icon from '@/components/icon';
import IconButton from '@/components/ui/icon-button';
import { useAddAccountsToList, useList, useRemoveAccountsFromList } from '@/queries/accounts/use-lists';

const messages = defineMessages({
  remove: { id: 'lists.account.remove', defaultMessage: 'Remove from list' },
  add: { id: 'lists.account.add', defaultMessage: 'Add to list' },
});

interface IList {
  accountId: string;
  listId: string;
  added?: boolean;
}

const List: React.FC<IList> = ({ listId, accountId, added }) => {
  const intl = useIntl();

  const { data: list } = useList(listId);

  const { mutate: addToList } = useAddAccountsToList(listId);
  const { mutate: removeFromList } = useRemoveAccountsFromList(listId);

  const onAdd = () => addToList([accountId]);
  const onRemove = () => removeFromList([accountId]);

  if (!list) return null;

  let button;

  if (added) {
    button = <IconButton className='text-gray-400 hover:text-gray-600' iconClassName='h-5 w-5' src={require('@phosphor-icons/core/regular/x.svg')} title={intl.formatMessage(messages.remove)} onClick={onRemove} />;
  } else {
    button = <IconButton className='text-gray-400 hover:text-gray-600' iconClassName='h-5 w-5' src={require('@phosphor-icons/core/regular/plus.svg')} title={intl.formatMessage(messages.add)} onClick={onAdd} />;
  }

  return (
    <div className='flex items-center gap-1.5 px-2 py-4 text-black dark:text-white'>
      <Icon src={require('@phosphor-icons/core/regular/list-bullets.svg')} />
      <span className='grow'>
        {list.title}
      </span>
      {button}
    </div>
  );
};

export { List as default };
