import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import SearchColumn from '@/columns/search';
import Column from '@/components/ui/column';
import Tabs from '@/components/ui/tabs';
import { useFeatures } from '@/hooks/use-features';
import { useAccount } from '@/queries/accounts/use-account';
import { queryKeys } from '@/queries/keys';
import { searchRoute } from '@/router';

import { AccountFilter } from './components/account-filter';
import { SearchInput } from './components/search-input';

type SearchFilter = 'accounts' | 'hashtags' | 'statuses' | 'links';

const messages = defineMessages({
  heading: { id: 'column.search', defaultMessage: 'Search' },
  accounts: { id: 'search_results.accounts', defaultMessage: 'People' },
  statuses: { id: 'search_results.statuses', defaultMessage: 'Posts' },
  hashtags: { id: 'search_results.hashtags', defaultMessage: 'Hashtags' },
  links: { id: 'search_results.links', defaultMessage: 'News' },
});

const SearchResults = () => {
  const intl = useIntl();
  const features = useFeatures();
  const queryClient = useQueryClient();

  const { q: value = '', type: selectedFilter = 'accounts', accountId } = searchRoute.useSearch();
  const navigate = useNavigate({ from: searchRoute.fullPath });

  const submitted = !!value.trim();

  const selectFilter = (newActiveFilter: SearchFilter) => {
    if (newActiveFilter === selectedFilter) {
      if (newActiveFilter === 'links') return;
      queryClient.refetchQueries({
        queryKey: queryKeys.search[newActiveFilter](
          value,
          newActiveFilter === 'statuses' ? { account_id: accountId } : undefined,
        ),
        exact: true,
      });
    } else navigate({ search: (prev) => ({ ...prev, type: newActiveFilter }) });
  };

  const { data: account } = useAccount(accountId);

  const handleUnsetAccount = () => {
    navigate({ search: ({ accountId, ...prev }) => prev });
  };

  const renderFilterBar = () => {
    const items = [];
    items.push(
      {
        text: intl.formatMessage(messages.accounts),
        action: () => {
          selectFilter('accounts');
        },
        name: 'accounts',
      },
      {
        text: intl.formatMessage(messages.statuses),
        action: () => {
          selectFilter('statuses');
        },
        name: 'statuses',
      },
      {
        text: intl.formatMessage(messages.hashtags),
        action: () => {
          selectFilter('hashtags');
        },
        name: 'hashtags',
      },
    );

    if (!submitted && features.trendingLinks)
      items.push({
        text: intl.formatMessage(messages.links),
        action: () => {
          selectFilter('links');
        },
        name: 'links',
      });

    return <Tabs items={items} activeItem={selectedFilter} />;
  };

  return (
    <>
      {accountId ? (
        <AccountFilter account={account} handleUnsetAccount={handleUnsetAccount} />
      ) : (
        renderFilterBar()
      )}

      <SearchColumn query={value} type={selectedFilter} accountId={accountId} />
    </>
  );
};

const SearchPage = () => {
  const intl = useIntl();

  const navigate = useNavigate({ from: searchRoute.fullPath });

  const { q: query } = searchRoute.useSearch();

  const setQuery = (value: string) => {
    navigate({ search: (prev) => ({ ...prev, q: value }) });
  };

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <div className='search-page'>
        <SearchInput className='search-page__input' query={query} setQuery={setQuery} />
        <SearchResults />
      </div>
    </Column>
  );
};

export { SearchResults, SearchPage as default };
