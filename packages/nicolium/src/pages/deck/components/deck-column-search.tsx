import clsx from 'clsx';
import React, { useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import Account from '@/components/accounts/account';
import PlaceholderAccount from '@/components/placeholders/placeholder-account';
import PlaceholderHashtag from '@/components/placeholders/placeholder-hashtag';
import ScrollableList from '@/components/scrollable-list';
import Input from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { useAccount } from '@/queries/accounts/use-account';
import { useSearchAccounts, useSearchHashtags } from '@/queries/search/use-search';

const messages = defineMessages({
  accountPlaceholder: { id: 'deck.column_picker.account', defaultMessage: 'Search for a profile…' },
  hashtagPlaceholder: { id: 'deck.column_picker.hashtag', defaultMessage: 'Search for a hashtag…' },
});

interface IAccountResult {
  id: string;
  onSelect: (accountId: string) => void;
}

const AccountResult: React.FC<IAccountResult> = ({ id, onSelect }) => {
  const { data: account } = useAccount(id);

  if (!account) return null;

  return (
    <button type='button' onClick={() => onSelect(account.id)}>
      <Account
        account={account}
        withLinkToProfile={false}
        showAccountHoverCard={false}
        hideActions
      />
    </button>
  );
};

interface IDeckColumnSearch {
  mode: 'account' | 'hashtag';
  onSelect: (value: string) => void;
}

/** Search picker shown in an unconfigured account or hashtag deck column. */
const DeckColumnSearch: React.FC<IDeckColumnSearch> = ({ mode, onSelect }) => {
  const intl = useIntl();
  const [value, setValue] = useState('');
  const query = useDebounce(value, 300);

  const accountsQuery = useSearchAccounts(mode === 'account' ? query : '');
  const hashtagsQuery = useSearchHashtags(mode === 'hashtag' ? query : '');
  const activeQuery = mode === 'account' ? accountsQuery : hashtagsQuery;

  const { hasNextPage, isFetching, isLoading, fetchNextPage } = activeQuery;

  const placeholder = intl.formatMessage(
    mode === 'account' ? messages.accountPlaceholder : messages.hashtagPlaceholder,
  );

  const results =
    mode === 'account'
      ? (accountsQuery.data ?? []).map((id) => (
          <AccountResult key={id} id={id} onSelect={onSelect} />
        ))
      : (hashtagsQuery.data ?? []).map((hashtag) => {
          const label = `#${hashtag.name}`;
          return (
            <button key={hashtag.name} type='button' onClick={() => onSelect(hashtag.name)}>
              {label}
            </button>
          );
        });

  return (
    <div className='deck-search deck-column-search'>
      <Input
        type='text'
        theme='search'
        placeholder={placeholder}
        aria-label={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />

      {query &&
        (results.length === 0 && !isFetching ? (
          <div className='empty-column-indicator'>
            <FormattedMessage
              id='deck.column_picker.empty'
              defaultMessage='There are no results for “{term}”'
              values={{ term: query }}
            />
          </div>
        ) : (
          <ScrollableList
            scrollKey={`deck-column-search:${mode}`}
            isLoading={isFetching}
            showLoading={isLoading}
            hasMore={hasNextPage}
            onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
            placeholderComponent={mode === 'account' ? PlaceholderAccount : PlaceholderHashtag}
            placeholderCount={20}
            itemClassName={clsx({
              'search-item__account': mode === 'account',
              'search-item__hashtag': mode === 'hashtag',
            })}
          >
            {results}
          </ScrollableList>
        ))}
    </div>
  );
};

export { DeckColumnSearch };
