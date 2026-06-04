import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { CardHeader, CardTitle } from '@/components/ui/card';
import Spinner from '@/components/ui/spinner';
import {
  useAddAccountsToList,
  useListAccounts,
  useRemoveAccountsFromList,
} from '@/queries/accounts/use-lists';
import { useAccountSearch } from '@/queries/search/use-search-accounts';

import Account from './account';
import Search from './search';

interface IListMembersForm {
  listId: string;
}

const ListMembersForm: React.FC<IListMembersForm> = ({ listId }) => {
  const [searchValue, setSearchValue] = useState('');

  const { data: accountIds = [] as Array<string>, isFetching } = useListAccounts(listId);
  const { data: searchAccountIds = [] } = useAccountSearch(searchValue, {
    following: true,
    limit: 5,
  });

  const { mutate: addToList } = useAddAccountsToList(listId);
  const { mutate: removeFromList } = useRemoveAccountsFromList(listId);

  const onAdd = (accountId: string) => {
    addToList([accountId]);
  };
  const onRemove = (accountId: string) => {
    removeFromList([accountId]);
  };

  return (
    <div className='list-members-modal__form__container'>
      {accountIds.length > 0 ? (
        <div className='list-members-modal__form'>
          <CardHeader>
            <CardTitle
              title={<FormattedMessage id='lists.account.members' defaultMessage='List members' />}
            />
          </CardHeader>
          <div className='list-members-modal__form__accounts'>
            {accountIds.map((accountId) => (
              <Account
                key={accountId}
                accountId={accountId}
                added={accountIds.includes(accountId)}
                onAdd={onAdd}
                onRemove={onRemove}
              />
            ))}
          </div>
        </div>
      ) : isFetching ? (
        <div className='list-members-modal__form__pending'>
          <Spinner />
        </div>
      ) : (
        <div className='list-members-modal__form__pending'>
          <p>
            <FormattedMessage
              id='empty_column.list_members'
              defaultMessage='There are no members in this list. Use search to find users to add.'
            />
          </p>
        </div>
      )}

      <div>
        <CardHeader>
          <CardTitle
            title={<FormattedMessage id='lists.account.add' defaultMessage='Add to list' />}
          />
        </CardHeader>
        <Search value={searchValue} onSubmit={setSearchValue} />
        <div className='list-members-modal__form__accounts'>
          {searchAccountIds.map((accountId) => (
            <Account
              key={accountId}
              accountId={accountId}
              added={accountIds.includes(accountId)}
              onAdd={onAdd}
              onRemove={onRemove}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export { ListMembersForm as default };
