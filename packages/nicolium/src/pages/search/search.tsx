import iconMagnifyingGlass from '@phosphor-icons/core/regular/magnifying-glass.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import SearchColumn from '@/columns/search';
import Column from '@/components/ui/column';
import Icon from '@/components/ui/icon';
import IconButton from '@/components/ui/icon-button';
import Input from '@/components/ui/input';
import Tabs from '@/components/ui/tabs';
import { useFeatures } from '@/hooks/use-features';
import { useAccount } from '@/queries/accounts/use-account';
import { queryKeys } from '@/queries/keys';
import { searchRoute } from '@/router';

type SearchFilter = 'accounts' | 'hashtags' | 'statuses' | 'links';

const messages = defineMessages({
  heading: { id: 'column.search', defaultMessage: 'Search' },
  placeholder: { id: 'search.placeholder', defaultMessage: 'Search' },
  clear: { id: 'search.clear', defaultMessage: 'Clear input' },
  clearAccountFilter: { id: 'search.clear_account_filter', defaultMessage: 'Clear account filter' },
  accounts: { id: 'search_results.accounts', defaultMessage: 'People' },
  statuses: { id: 'search_results.statuses', defaultMessage: 'Posts' },
  hashtags: { id: 'search_results.hashtags', defaultMessage: 'Hashtags' },
  links: { id: 'search_results.links', defaultMessage: 'News' },
});

interface ISearchInput {
  className?: string;
  placeholder?: string;
  query?: string;
  setQuery?: (value: string) => void;
}

const SearchInput: React.FC<ISearchInput> = ({ className, placeholder, query, setQuery }) => {
  const [value, setValue] = useState(query ?? '');

  const intl = useIntl();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setValue(value);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (query === value) {
      if (value.length > 0) {
        setValue('');
        setQuery('');
      }
    } else {
      setQuery(value);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      setQuery(value);
    } else if (event.key === 'Escape') {
      document.querySelector('.ui')?.parentElement?.focus();
    }
  };

  return (
    <div className={clsx('search-input', className)}>
      <div>
        <Input
          type='text'
          id='search'
          placeholder={placeholder ?? intl.formatMessage(messages.placeholder)}
          aria-label={placeholder ?? intl.formatMessage(messages.placeholder)}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoFocus
          theme='search'
        />

        <button
          tabIndex={value ? 0 : -1}
          onClick={handleClick}
          title={
            query === value
              ? intl.formatMessage(messages.clear)
              : intl.formatMessage(messages.placeholder)
          }
        >
          {query === value ? <Icon src={iconX} /> : <Icon src={iconMagnifyingGlass} />}
        </button>
      </div>
    </div>
  );
};

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
        <div className='search-page__account'>
          <IconButton
            src={iconX}
            onClick={handleUnsetAccount}
            title={intl.formatMessage(messages.clearAccountFilter)}
          />
          <p>
            <FormattedMessage
              id='search_results.filter_message'
              defaultMessage='You are searching for posts from @{acct}.'
              values={{ acct: <strong className='break-words'>{account?.acct}</strong> }}
            />
          </p>
        </div>
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

export { SearchInput, SearchResults, SearchPage as default };
