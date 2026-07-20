import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { AccountMembersList } from '@/modals/list-editor-modal/components/account-members-list';
import {
  useAddAccountsToList,
  useListAccounts,
  useRemoveAccountsFromList,
} from '@/queries/accounts/use-lists';
import { useAccountSearch } from '@/queries/search/use-search-accounts';

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
      <AccountMembersList
        accountIds={accountIds}
        searchAccountIds={searchAccountIds}
        isFetching={isFetching}
        searchValue={searchValue}
        onSearch={setSearchValue}
        onAdd={onAdd}
        onRemove={onRemove}
        membersTitle={<FormattedMessage id='lists.account.members' defaultMessage='List members' />}
        addTitle={<FormattedMessage id='lists.account.add' defaultMessage='Add to list' />}
        emptyMessage={
          <FormattedMessage
            id='empty_column.list_members'
            defaultMessage='There are no members in this list. Use search to find users to add.'
          />
        }
      />
    </div>
  );
};

export { ListMembersForm as default };
