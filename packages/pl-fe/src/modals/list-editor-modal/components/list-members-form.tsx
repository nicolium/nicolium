import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { CardHeader, CardTitle } from 'pl-fe/components/ui/card';
import { useListAccounts } from 'pl-fe/queries/accounts/use-lists';
import { useAccountSearch } from 'pl-fe/queries/search/use-search-accounts';

import Account from './account';
import Search from './search';

const messages = defineMessages({
  addToList: { id: 'lists.account.add', defaultMessage: 'Add to list' },
  removeFromList: { id: 'lists.account.remove', defaultMessage: 'Remove from list' },
});

interface IListMembersForm {
  listId: string;
}

const ListMembersForm: React.FC<IListMembersForm> = ({ listId }) => {
  const intl = useIntl();

  const [searchValue, setSearchValue] = useState('');

  const { data: accountIds = [] } = useListAccounts(listId);
  const { data: searchAccountIds = [] } = useAccountSearch(searchValue, { following: true, limit: 5 });

  return (
    <>
      {accountIds.length > 0 && (
        <>
          <div>
            <CardHeader>
              <CardTitle title={intl.formatMessage(messages.removeFromList)} />
            </CardHeader>
            <div className='max-h-48 overflow-y-auto'>
              {accountIds.map(accountId => <Account key={accountId} listId={listId} accountId={accountId} added={accountIds.includes(accountId)} />)}
            </div>
          </div>
          <br />
        </>
      )}

      <CardHeader>
        <CardTitle title={intl.formatMessage(messages.addToList)} />
      </CardHeader>
      <Search value={searchValue} onSubmit={setSearchValue} />
      <div className='max-h-48 overflow-y-auto'>
        {searchAccountIds.map(accountId => <Account key={accountId} listId={listId} accountId={accountId} added={accountIds.includes(accountId)} />)}
      </div>
    </>
  );
};

export { ListMembersForm as default };
