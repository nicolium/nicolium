import iconArrowsClockwise from '@phosphor-icons/core/regular/arrows-clockwise.svg';
import { useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import React, { useRef } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import Hashtag from '@/components/hashtag';
import PlaceholderAccount from '@/components/placeholders/placeholder-account';
import PlaceholderHashtag from '@/components/placeholders/placeholder-hashtag';
import PlaceholderStatus from '@/components/placeholders/placeholder-status';
import PullToRefresh from '@/components/pull-to-refresh';
import ScrollableList from '@/components/scrollable-list';
import StatusContainer from '@/components/statuses/status-container';
import IconButton from '@/components/ui/icon-button';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryKeys } from '@/queries/keys';
import { scopedQueryKey } from '@/queries/query';
import {
  useSearchAccounts,
  useSearchHashtags,
  useSearchStatuses,
} from '@/queries/search/use-search';
import { userTouching } from '@/utils/is-mobile';
import { selectChild } from '@/utils/scroll-utils';

import TrendsColumn from './trends';

import type { VirtuosoHandle } from 'react-virtuoso';

const messages = defineMessages({
  refresh: { id: 'search.refresh', defaultMessage: 'Refresh search results' },
});

interface ISearchColumn {
  /** Type of entities to search for. */
  type: 'accounts' | 'hashtags' | 'statuses' | 'links';
  /** Search query. When empty, will fallback to trending items when available. */
  query: string;
  /** ID of the account, when searching for posts from given account. */
  accountId?: string;
}

const SearchColumn: React.FC<ISearchColumn> = ({ type, query, accountId }) => {
  query = query.trim();

  const columnId: string = useRef(`search-results-${crypto.randomUUID()}`).current;
  const node = useRef<VirtuosoHandle | null>(null);
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  const pullToRefreshEnabled = userTouching.matches;

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

  const refetch = () => {
    if (type !== 'links') {
      return queryClient.resetQueries({
        queryKey: scopedQueryKey(
          queryKeys.search[type](
            query,
            type === 'statuses' ? { account_id: accountId } : undefined,
          ),
          scopeUrl,
        ),
        exact: true,
      });
    }
  };

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
      if (!query && !accountId) return <TrendsColumn type={type} />;
      else if (!query) return null;
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

  const body = (
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

  if (!pullToRefreshEnabled || type === 'links' || !query) return body;

  return <PullToRefresh onRefresh={refetch}>{body}</PullToRefresh>;
};

const SearchRefreshButton: React.FC<ISearchColumn> = ({ type, query = '', accountId }) => {
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();
  const intl = useIntl();

  const searchAccountsQuery = useSearchAccounts((type === 'accounts' && query) || '');
  const searchStatusesQuery = useSearchStatuses((type === 'statuses' && query) || '', {
    account_id: accountId,
  });
  const searchHashtagsQuery = useSearchHashtags((type === 'hashtags' && query) || '');

  if (userTouching.matches || !query || type === 'links') return null;

  const { isPending } = {
    accounts: searchAccountsQuery,
    statuses: searchStatusesQuery,
    hashtags: searchHashtagsQuery,
    links: searchStatusesQuery,
  }[type];

  const refetch = () =>
    queryClient.resetQueries({
      queryKey: scopedQueryKey(
        queryKeys.search[type](query, type === 'statuses' ? { account_id: accountId } : undefined),
        scopeUrl,
      ),
      exact: true,
    });

  return (
    <IconButton
      disabled={isPending}
      className='timeline-refresh-button'
      title={intl.formatMessage(messages.refresh)}
      src={iconArrowsClockwise}
      onClick={refetch}
    />
  );
};

export { SearchColumn as default, SearchRefreshButton };
