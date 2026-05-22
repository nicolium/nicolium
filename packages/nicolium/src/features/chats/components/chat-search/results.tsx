import clsx from 'clsx';
import React, { useCallback, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';

import VerificationBadge from '@/components/accounts/verification-badge';
import Avatar from '@/components/ui/avatar';
import { useAccounts } from '@/queries/accounts/use-accounts';

import type { useAccountSearch } from '@/queries/search/use-search-accounts';
import type { Account } from 'pl-api';

interface IResults {
  accountSearchResult: ReturnType<typeof useAccountSearch>;
  onSelect(id: string): void;
}

const Results = ({ accountSearchResult, onSelect }: IResults) => {
  const { data: accountIds = [], isFetching, hasNextPage, fetchNextPage } = accountSearchResult;
  const { data: accounts } = useAccounts(accountIds);

  const [isNearBottom, setNearBottom] = useState<boolean>(false);
  const [isNearTop, setNearTop] = useState<boolean>(true);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  };

  const renderAccount = useCallback(
    (account: Account) => (
      <button
        key={account.id}
        type='button'
        className='⁂-chat-search__result'
        onClick={() => {
          onSelect(account.id);
        }}
        data-testid='account'
      >
        <Avatar
          src={account.avatar}
          alt={account.avatar_description}
          size={40}
          isCat={account.is_cat}
          username={account.username}
        />

        <div className='⁂-chat-search__result__content'>
          <div className='⁂-chat-search__result__name'>
            <span>{account.display_name}</span>
            {account.verified && <VerificationBadge />}
          </div>
          <span className='⁂-chat-search__result__acct' dir='ltr'>
            {account.acct}
          </span>
        </div>
      </button>
    ),
    [],
  );

  return (
    <div className='⁂-chat-search__results'>
      <Virtuoso
        data={accounts}
        itemContent={(_index, chat) => (
          <div className='⁂-chat-search__result__container'>{renderAccount(chat)}</div>
        )}
        endReached={handleLoadMore}
        atTopStateChange={(atTop) => {
          setNearTop(atTop);
        }}
        atBottomStateChange={(atBottom) => {
          setNearBottom(atBottom);
        }}
      />

      <div
        className={clsx('⁂-chat-search__fade ⁂-chat-search__fade--top', {
          '⁂-chat-search__fade--hidden': isNearTop,
          '⁂-chat-search__fade--visible': !isNearTop,
        })}
      />
      <div
        className={clsx('⁂-chat-search__fade ⁂-chat-search__fade--bottom', {
          '⁂-chat-search__fade--hidden': isNearBottom,
          '⁂-chat-search__fade--visible': !isNearBottom,
        })}
      />
    </div>
  );
};

export { Results as default };
