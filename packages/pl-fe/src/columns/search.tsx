import clsx from 'clsx';
import React, { useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import Hashtag from 'pl-fe/components/hashtag';
import ScrollableList from 'pl-fe/components/scrollable-list';
import AccountContainer from 'pl-fe/containers/account-container';
import StatusContainer from 'pl-fe/containers/status-container';
import PlaceholderAccount from 'pl-fe/features/placeholder/components/placeholder-account';
import PlaceholderHashtag from 'pl-fe/features/placeholder/components/placeholder-hashtag';
import PlaceholderStatus from 'pl-fe/features/placeholder/components/placeholder-status';
import { useSearchAccounts, useSearchHashtags, useSearchStatuses } from 'pl-fe/queries/search/use-search';
import { selectChild } from 'pl-fe/utils/scroll-utils';

import TrendsColumn from './trends';

import type { VirtuosoHandle } from 'react-virtuoso';

interface ISearchColumn {
  type: 'accounts' | 'hashtags' | 'statuses' | 'links';
  query: string;
  accountId?: string;
  multiColumn?: boolean;
}

const SearchColumn: React.FC<ISearchColumn> = ({ type, query, accountId, multiColumn }) => {
  query = query.trim();

  const node = useRef<VirtuosoHandle>(null);

  const searchAccountsQuery = useSearchAccounts(type === 'accounts' && query || '');
  const searchStatusesQuery = useSearchStatuses(type === 'statuses' && query || '', {
    account_id: accountId,
  });
  const searchHashtagsQuery = useSearchHashtags(type === 'hashtags' && query || '');

  const activeQuery = ({
    accounts: searchAccountsQuery,
    statuses: searchStatusesQuery,
    hashtags: searchHashtagsQuery,
    links: searchStatusesQuery,
  })[type]!;

  const getCurrentIndex = (id: string): number => resultsIds?.findIndex(key => key === id);

  const handleMoveUp = (id: string) => {
    if (!resultsIds) return;

    const elementIndex = getCurrentIndex(id) - 1;
    selectChild(elementIndex, node, document.getElementById('search-results') || undefined);
  };

  const handleMoveDown = (id: string) => {
    if (!resultsIds) return;

    const elementIndex = getCurrentIndex(id) + 1;
    selectChild(elementIndex, node, document.getElementById('search-results') || undefined);
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
        searchResults = searchAccountsQuery.data.map(accountId => <AccountContainer key={accountId} id={accountId} />);
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
        searchResults = searchStatusesQuery.data.map(statusId => <StatusContainer key={statusId} id={statusId} onMoveUp={handleMoveUp} onMoveDown={handleMoveDown} />);
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
        resultsIds = searchHashtagsQuery.data.map(hashtag => hashtag.name);
        searchResults = searchHashtagsQuery.data.map(hashtag => <Hashtag key={hashtag.name} hashtag={hashtag} />);
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
      id='search-results'
      key={type}
      isLoading={!!query && isFetching}
      showLoading={isLoading}
      hasMore={hasMore}
      onLoadMore={handleLoadMore}
      placeholderComponent={placeholderComponent}
      placeholderCount={20}
      listClassName={type === 'statuses' ? 'divide-y divide-solid divide-gray-200 dark:divide-gray-800' : ''}
      itemClassName={clsx({
        'pb-4': type === 'accounts' || type === 'links',
        'pb-3': type === 'hashtags',
      })}
      useWindowScroll={!multiColumn}
    >
      {searchResults || []}
    </ScrollableList>
  );
};

export { SearchColumn as default };
