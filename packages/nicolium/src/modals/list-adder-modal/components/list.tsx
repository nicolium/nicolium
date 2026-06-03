import iconListBullets from '@phosphor-icons/core/regular/list-bullets.svg';
import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Icon from '@/components/ui/icon';
import IconButton from '@/components/ui/icon-button';
import {
  useAddAccountsToList,
  useList,
  useRemoveAccountsFromList,
} from '@/queries/accounts/use-lists';

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

  const onAdd = () => {
    addToList([accountId]);
  };
  const onRemove = () => {
    removeFromList([accountId]);
  };

  if (!list) return null;

  let button;

  if (added) {
    button = (
      <IconButton src={iconX} title={intl.formatMessage(messages.remove)} onClick={onRemove} />
    );
  } else {
    button = <IconButton src={iconPlus} title={intl.formatMessage(messages.add)} onClick={onAdd} />;
  }

  return (
    <div className='list-adder-modal__list'>
      <Icon src={iconListBullets} />
      <span>{list.title}</span>
      {button}
    </div>
  );
};

export { List as default };
