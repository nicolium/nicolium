import iconMagnifyingGlass from '@phosphor-icons/core/regular/magnifying-glass.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import SearchColumn from '@/columns/search';
import Column from '@/components/ui/column';
import IconButton from '@/components/ui/icon-button';
import Input from '@/components/ui/input';
import SvgIcon from '@/components/ui/svg-icon';
import Tabs from '@/components/ui/tabs';
import Text from '@/components/ui/text';
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
}

const SearchInput: React.FC<ISearchInput> = ({ className, placeholder, query }) => {
  const navigate = useNavigate({ from: searchRoute.fullPath });
  const [value, setValue] = useState(query ?? '');

  const intl = useIntl();

  const setQuery = (value: string) => {
    navigate({ search: (prev) => ({ ...prev, q: value }) });
  };

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
    <div
      className={clsx(
        'z-10 w-full bg-white/90 backdrop-blur backdrop-saturate-200 black:bg-black/75 dark:bg-primary-900/90',
        className,
      )}
    >
      <div className='relative'>
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
          className='pr-10 rtl:pl-10 rtl:pr-3'
        />

        <button
          tabIndex={value ? 0 : -1}
          className='absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 rtl:left-0 rtl:right-auto'
          onClick={handleClick}
          title={
            query === value
              ? intl.formatMessage(messages.clear)
              : intl.formatMessage(messages.placeholder)
          }
        >
          {query === value ? (
            <SvgIcon src={iconX} className='size-4 text-gray-600' />
          ) : (
            <SvgIcon src={iconMagnifyingGlass} className='size-4 text-gray-600' />
          )}
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
        <div className='flex items-center gap-2 border-b border-solid border-gray-200 p-2 pb-4 dark:border-gray-800'>
          <IconButton
            className='text-gray-400 hover:text-gray-600'
            iconClassName='h-5 w-5'
            src={iconX}
            onClick={handleUnsetAccount}
            title={intl.formatMessage(messages.clearAccountFilter)}
          />
          <Text truncate>
            <FormattedMessage
              id='search_results.filter_message'
              defaultMessage='You are searching for posts from @{acct}.'
              values={{ acct: <strong className='break-words'>{account?.acct}</strong> }}
            />
          </Text>
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

  const { q: query } = searchRoute.useSearch();

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <div className='space-y-4'>
        <SearchInput className='sticky top-[74px]' query={query} />
        <SearchResults />
      </div>
    </Column>
  );
};

export { SearchInput, SearchPage as default };
