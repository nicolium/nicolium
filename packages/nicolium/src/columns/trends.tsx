import clsx from 'clsx';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import { EmptyMessage } from '@/components/empty-message';
import Hashtag from '@/components/hashtag';
import ScrollableList from '@/components/scrollable-list';
import StatusContainer from '@/components/statuses/status-container';
import TrendingLink from '@/components/trending-link';
import Button from '@/components/ui/button';
import PlaceholderAccount from '@/features/placeholder/components/placeholder-account';
import PlaceholderHashtag from '@/features/placeholder/components/placeholder-hashtag';
import PlaceholderStatus from '@/features/placeholder/components/placeholder-status';
import { useFeatures } from '@/hooks/use-features';
import { useSuggestedAccounts } from '@/queries/trends/use-suggested-accounts';
import { useTrendingLinks } from '@/queries/trends/use-trending-links';
import { useTrendingStatuses } from '@/queries/trends/use-trending-statuses';
import useTrendingTags from '@/queries/trends/use-trending-tags';

interface ITrendsColumn {
  type: 'accounts' | 'hashtags' | 'statuses' | 'links';
  emptyMessage?: React.JSX.Element;
  multiColumn?: boolean;
}

const TrendsColumn: React.FC<ITrendsColumn> = ({ type, multiColumn }) => {
  const features = useFeatures();

  const {
    data: accounts,
    isFetching: isFetchingAccounts,
    isLoading: isLoadingAccounts,
  } = useSuggestedAccounts();
  const {
    data: trendingTags,
    isFetching: isFetchingTags,
    isLoading: isLoadingTags,
  } = useTrendingTags();
  const {
    data: trendingStatuses,
    isFetching: isFetchingStatuses,
    isLoading: isLoadingStatuses,
  } = useTrendingStatuses();
  const {
    data: trendingLinks,
    isFetching: isFetchingLinks,
    isLoading: isLoadingLinks,
  } = useTrendingLinks();

  let placeholderComponent = PlaceholderStatus;

  let children;
  let isFetching;
  let isLoading;

  switch (type) {
    case 'accounts': {
      children = accounts?.map((account) => (
        <AccountContainer key={account.account_id} id={account.account_id} />
      ));
      isFetching = isFetchingAccounts;
      isLoading = isLoadingAccounts;
      placeholderComponent = PlaceholderAccount;

      console.log(accounts, isFetching, isLoading);
      if (!isFetching && !isLoading && accounts?.length === 0) {
        children = [
          <EmptyMessage
            key='key-is-required'
            text={
              <div className='flex flex-col items-center gap-4'>
                <FormattedMessage
                  id='trends.no_accounts.first_line'
                  defaultMessage='No suggested accounts found.'
                />
                <br />
                {features.profileDirectory ? (
                  <>
                    <FormattedMessage
                      id='trends.no_accounts.second_line'
                      defaultMessage='Try entering a search query or browsing the profile directory to find accounts to follow.'
                    />
                    <Button to='/directory' theme='muted'>
                      <FormattedMessage id='column.directory' defaultMessage='Profile directory' />
                    </Button>
                  </>
                ) : (
                  <FormattedMessage
                    id='trends.no_accounts.second_line.no_directory'
                    defaultMessage='Try entering a search query to find accounts to follow.'
                  />
                )}
              </div>
            }
          />,
        ];
      }
      break;
    }
    case 'hashtags': {
      children = trendingTags?.map((tag) => <Hashtag key={tag.name} hashtag={tag} />);
      isFetching = isFetchingTags;
      isLoading = isLoadingTags;
      placeholderComponent = PlaceholderHashtag;
      break;
    }
    case 'statuses': {
      children = trendingStatuses?.map((statusId) => (
        <StatusContainer key={statusId} id={statusId} />
      ));
      isFetching = isFetchingStatuses;
      isLoading = isLoadingStatuses;
      break;
    }
    case 'links': {
      children = trendingLinks?.map((link) => <TrendingLink key={link.id} trendingLink={link} />);
      isFetching = isFetchingLinks;
      isLoading = isLoadingLinks;
      break;
    }
  }

  return (
    <ScrollableList
      scrollKey={`trends:${type}`}
      // ref={node}
      id='trends'
      key={type}
      isLoading={isFetching}
      showLoading={isLoading}
      placeholderComponent={placeholderComponent}
      placeholderCount={20}
      listClassName={type === 'statuses' ? '⁂-status-list' : ''}
      itemClassName={clsx({
        'pb-4': type === 'accounts' || type === 'links',
        'pb-3': type === 'hashtags',
      })}
      useWindowScroll={!multiColumn}
    >
      {children ?? []}
    </ScrollableList>
  );
};

export { TrendsColumn as default };
