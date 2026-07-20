import React from 'react';

import { CardHeader, CardTitle } from '@/components/ui/card';
import Spinner from '@/components/ui/spinner';

import Account from './account';
import Search from './search';

interface IAccountMembersList {
  accountIds: Array<string>;
  searchAccountIds: Array<string>;
  isFetching: boolean;
  searchValue: string;
  onSearch: (value: string) => void;
  onAdd: (accountId: string) => void;
  onRemove: (accountId: string) => void;
  membersTitle: React.ReactNode;
  addTitle: React.ReactNode;
  emptyMessage: React.ReactNode;
}

const AccountMembersList: React.FC<IAccountMembersList> = ({
  accountIds,
  searchAccountIds,
  isFetching,
  searchValue,
  onSearch,
  onAdd,
  onRemove,
  membersTitle,
  addTitle,
  emptyMessage,
}) => (
  <>
    {accountIds.length > 0 ? (
      <div className='list-members-modal__form'>
        <CardHeader>
          <CardTitle title={membersTitle} />
        </CardHeader>
        <div className='list-members-modal__form__accounts'>
          {accountIds.map((accountId) => (
            <Account
              key={accountId}
              accountId={accountId}
              added
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
        <p>{emptyMessage}</p>
      </div>
    )}

    <div>
      <CardHeader>
        <CardTitle title={addTitle} />
      </CardHeader>
      <Search value={searchValue} onSubmit={onSearch} />
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
  </>
);

export { AccountMembersList, type IAccountMembersList };
