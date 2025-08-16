import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { CardHeader, CardTitle } from 'pl-fe/components/ui/card';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { useAddAccountsToList, useListAccounts, useRemoveAccountsFromList } from 'pl-fe/queries/accounts/use-lists';
import { useAccountSearch } from 'pl-fe/queries/search/use-search-accounts';

import Account from './account';
import Search from './search';

const messages = defineMessages({
  addToList: { id: 'lists.account.add', defaultMessage: 'Add to list' },
  removeFromList: { id: 'lists.account.remove', defaultMessage: 'List members' },
});

interface IListMembersForm {
  listId: string;
}

const ListMembersForm: React.FC<IListMembersForm> = ({ listId }) => {
  const intl = useIntl();

  const [searchValue, setSearchValue] = useState('');

  const { data: accountIds = [] } = useListAccounts(listId);
  const { data: searchAccountIds = [] } = useAccountSearch(searchValue, { following: true, limit: 5 });

  const { mutate: addToList } = useAddAccountsToList(listId);
  const { mutate: removeFromList } = useRemoveAccountsFromList(listId);

  const onAdd = (accountId: string) => addToList([accountId]);
  const onRemove = (accountId: string) => removeFromList([accountId]);

  return (
    <Stack space={2}>
      {accountIds.length > 0 ? (
        <div>
          <CardHeader>
            <CardTitle title={intl.formatMessage(messages.removeFromList)} />
          </CardHeader>
          <div className='max-h-48 overflow-y-auto'>
            {accountIds.map(accountId => <Account key={accountId} accountId={accountId} added={accountIds.includes(accountId)} onAdd={onAdd} onRemove={onRemove} />)}
          </div>
        </div>
      ) : (
        <Text theme='muted' size='sm'>
          <FormattedMessage id='empty_column.list_members' defaultMessage='There are no members in this list. Use search to find users to add.' />
        </Text>
      )}

      <div>
        <CardHeader>
          <CardTitle title={intl.formatMessage(messages.addToList)} />
        </CardHeader>
        <Search value={searchValue} onSubmit={setSearchValue} />
        <div className='max-h-48 overflow-y-auto'>
          {searchAccountIds.map(accountId => <Account key={accountId} accountId={accountId} added={accountIds.includes(accountId)} onAdd={onAdd} onRemove={onRemove} />)}
        </div>
      </div>
    </Stack>
  );
};

export { ListMembersForm as default };
