import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import { useSearchParams } from 'react-router-dom-v5-compat';

import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import SearchColumn from 'pl-fe/columns/search';
import IconButton from 'pl-fe/components/icon-button';
import Column from 'pl-fe/components/ui/column';
import HStack from 'pl-fe/components/ui/hstack';
import Input from 'pl-fe/components/ui/input';
import SvgIcon from 'pl-fe/components/ui/svg-icon';
import Tabs from 'pl-fe/components/ui/tabs';
import Text from 'pl-fe/components/ui/text';
import { useFeatures } from 'pl-fe/hooks/use-features';

type SearchFilter = 'accounts' | 'hashtags' | 'statuses' | 'links';

const messages = defineMessages({
  heading: { id: 'column.search', defaultMessage: 'Search' },
  placeholder: { id: 'search.placeholder', defaultMessage: 'Search' },
  accounts: { id: 'search_results.accounts', defaultMessage: 'People' },
  statuses: { id: 'search_results.statuses', defaultMessage: 'Posts' },
  hashtags: { id: 'search_results.hashtags', defaultMessage: 'Hashtags' },
  links: { id: 'search_results.links', defaultMessage: 'News' },
});

interface ISearchInput {
  placeholder?: string;
}

const SearchInput: React.FC<ISearchInput> = ({ placeholder }) => {
  const [params, setParams] = useSearchParams();
  const [value, setValue] = useState(params.get('q') || '');

  const intl = useIntl();

  const setQuery = (value: string) => {
    setParams(params => ({ ...Object.fromEntries(params.entries()), q: value }));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setValue(value);
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (params.get('q') === value) {
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
      className='sticky top-[74px] z-10 w-full bg-white/90 backdrop-blur black:bg-black/80 dark:bg-primary-900/90'
    >
      <label htmlFor='search' className='sr-only'>{placeholder || intl.formatMessage(messages.placeholder)}</label>

      <div className='relative'>
        <Input
          type='text'
          id='search'
          placeholder={placeholder || intl.formatMessage(messages.placeholder)}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoFocus
          theme='search'
          className='pr-10 rtl:pl-10 rtl:pr-3'
        />

        <div
          role='button'
          tabIndex={0}
          className='absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 rtl:left-0 rtl:right-auto'
          onClick={handleClick}
        >
          {params.get('q') === value ? (
            <SvgIcon
              src={require('@phosphor-icons/core/regular/x.svg')}
              className='size-4 text-gray-600'
              aria-label={intl.formatMessage(messages.placeholder)}
            />
          ) : (
            <SvgIcon
              src={require('@phosphor-icons/core/regular/magnifying-glass.svg')}
              className='size-4 text-gray-600'
            />
          )}
        </div>
      </div>
    </div>
  );
};

const SearchResults = () => {
  const intl = useIntl();
  const features = useFeatures();
  const queryClient = useQueryClient();

  const [params, setParams] = useSearchParams();

  const value = params.get('q') || '';
  const submitted = !!value.trim();
  const selectedFilter = (params.get('type') || 'accounts') as SearchFilter;
  const accountId = params.get('accountId') || undefined;

  const selectFilter = (newActiveFilter: SearchFilter) => {
    if (newActiveFilter === selectedFilter) {
      queryClient.refetchQueries({
        queryKey: ['search', newActiveFilter, value, newActiveFilter === 'statuses' ? { account_id: accountId } : undefined],
        exact: true,
      });
    } else setParams(params => ({ ...Object.fromEntries(params.entries()), type: newActiveFilter }));
  };

  const { account } = useAccount(accountId);

  const handleUnsetAccount = () => {
    params.delete('accountId');
    setParams(params => Object.fromEntries(params.entries()));
  };

  const renderFilterBar = () => {
    const items = [];
    items.push(
      {
        text: intl.formatMessage(messages.accounts),
        action: () => selectFilter('accounts'),
        name: 'accounts',
      },
      {
        text: intl.formatMessage(messages.statuses),
        action: () => selectFilter('statuses'),
        name: 'statuses',
      },
      {
        text: intl.formatMessage(messages.hashtags),
        action: () => selectFilter('hashtags'),
        name: 'hashtags',
      },
    );

    if (!submitted && features.trendingLinks) items.push({
      text: intl.formatMessage(messages.links),
      action: () => selectFilter('links'),
      name: 'links',
    });

    return <Tabs items={items} activeItem={selectedFilter} />;
  };

  return (
    <>
      {accountId ? (
        <HStack className='border-b border-solid border-gray-200 p-2 pb-4 dark:border-gray-800' alignItems='center' space={2}>
          <IconButton iconClassName='h-5 w-5' src={require('@phosphor-icons/core/regular/x.svg')} onClick={handleUnsetAccount} />
          <Text truncate>
            <FormattedMessage
              id='search_results.filter_message'
              defaultMessage='You are searching for posts from @{acct}.'
              values={{ acct: <strong className='break-words'>{account?.acct}</strong> }}
            />
          </Text>
        </HStack>
      ) : renderFilterBar()}

      <SearchColumn query={value} type={selectedFilter} accountId={accountId} />
    </>
  );
};

const SearchPage = () => {
  const intl = useIntl();

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <div className='space-y-4'>
        <SearchInput />
        <SearchResults />
      </div>
    </Column>
  );
};

export { SearchInput, SearchPage as default };
