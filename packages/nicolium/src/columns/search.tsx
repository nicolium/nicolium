import clsx from 'clsx';
import React, { useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import Hashtag from '@/components/hashtag';
import PlaceholderAccount from '@/components/placeholders/placeholder-account';
import PlaceholderHashtag from '@/components/placeholders/placeholder-hashtag';
import PlaceholderStatus from '@/components/placeholders/placeholder-status';
import ScrollableList from '@/components/scrollable-list';
import StatusContainer from '@/components/statuses/status-container';
import {
  useSearchAccounts,
  useSearchHashtags,
  useSearchStatuses,
} from '@/queries/search/use-search';
import { selectChild } from '@/utils/scroll-utils';

import TrendsColumn from './trends';

import type { VirtuosoHandle } from 'react-virtuoso';

interface ISearchColumn {
  type: 'accounts' | 'hashtags' | 'statuses' | 'links';
  query: string;
  accountId?: string;
}

const SearchColumn: React.FC<ISearchColumn> = ({ type, query, accountId }) => {
  query = query.trim();

  const columnId: string = useRef(`search-results-${crypto.randomUUID()}`).current;
  const node = useRef<VirtuosoHandle | null>(null);

  const searchAccountsQuery = useSearchAccounts((type === 'accounts' && query) || '');
  const searchStatusesQuery = useSearchStatuses((type === 'statuses' && query) || '', {
    account_id: accountId,
  });
  const searchHashtagsQuery = useSearchHashtags((type === 'hashtags' && query) || '');

  const activeQuery = {
    accounts: searchAccountsQuery,
    statuses: searchStatusesQuery,
    hashtags: searchHashtagsQuery,
    links: searchStatusesQuery,
  }[type];

  const getCurrentIndex = (id: string): number => resultsIds?.findIndex((key) => key === id);

  const handleMoveUp = (id: string) => {
    if (!resultsIds) return;

    const elementIndex = getCurrentIndex(id) - 1;
    selectChild(elementIndex, node, document.getElementById(columnId) ?? undefined);
  };

  const handleMoveDown = (id: string) => {
    if (!resultsIds) return;

    const elementIndex = getCurrentIndex(id) + 1;
    selectChild(
      elementIndex,
      node,
      document.getElementById(columnId) ?? undefined,
      resultsIds.length,
    );
  };

  const handleLoadMore = () => activeQuery.fetchNextPage({ cancelRefetch: false });

  let searchResults;
  const { hasNextPage: hasMore, isFetching, isLoading } = activeQuery;
  let placeholderComponent = PlaceholderStatus;
  let resultsIds: Array<string>;

  switch (type) {
    case 'accounts': {
      placeholderComponent = PlaceholderAccount;
      if (!query) return <TrendsColumn type='accounts' />;
      if (searchAccountsQuery.data && searchAccountsQuery.data.length > 0) {
        resultsIds = searchAccountsQuery.data;
        searchResults = searchAccountsQuery.data.map((accountId) => (
          <AccountContainer key={accountId} id={accountId} />
        ));
      } else if (!isFetching) {
        return (
          <div className='empty-column-indicator'>
            <FormattedMessage
              id='empty_column.search.accounts'
              defaultMessage='There are no people results for "{term}"'
              values={{ term: query }}
            />
          </div>
        );
      }
      break;
    }
    case 'statuses':
    case 'links': {
      if (!query) return <TrendsColumn type='statuses' />;
      if (searchStatusesQuery.data && searchStatusesQuery.data.length > 0) {
        resultsIds = searchStatusesQuery.data;
        searchResults = searchStatusesQuery.data.map((statusId) => (
          <StatusContainer
            key={statusId}
            id={statusId}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
          />
        ));
      } else if (!isFetching) {
        return (
          <div className='empty-column-indicator'>
            <FormattedMessage
              id='empty_column.search.statuses'
              defaultMessage='There are no posts results for "{term}"'
              values={{ term: query }}
            />
          </div>
        );
      }
      break;
    }
    case 'hashtags': {
      placeholderComponent = PlaceholderHashtag;
      if (!query) return <TrendsColumn type='hashtags' />;
      if (searchHashtagsQuery.data && searchHashtagsQuery.data.length > 0) {
        resultsIds = searchHashtagsQuery.data.map((hashtag) => hashtag.name);
        searchResults = searchHashtagsQuery.data.map((hashtag) => (
          <Hashtag key={hashtag.name} hashtag={hashtag} />
        ));
      } else if (!isFetching) {
        return (
          <div className='empty-column-indicator'>
            <FormattedMessage
              id='empty_column.search.statuses'
              defaultMessage='There are no posts results for "{term}"'
              values={{ term: query }}
            />
          </div>
        );
      }
      break;
    }
  }

  return (
    <ScrollableList
      scrollKey={`search-results:${type}`}
      ref={node}
      id={columnId}
      key={type}
      isLoading={!!query && isFetching}
      showLoading={isLoading}
      hasMore={hasMore}
      onLoadMore={handleLoadMore}
      placeholderComponent={placeholderComponent}
      placeholderCount={20}
      listClassName={type === 'statuses' ? 'status-list' : ''}
      itemClassName={clsx({
        'search-item__account': type === 'accounts' || type === 'links',
        'search-item__hashtag': type === 'hashtags',
      })}
    >
      {searchResults ?? []}
    </ScrollableList>
  );
};

export { SearchColumn as default };
