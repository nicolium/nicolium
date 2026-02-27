import clsx from 'clsx';
import React from 'react';

import Hashtag from '@/components/hashtag';
import ScrollableList from '@/components/scrollable-list';
import TrendingLink from '@/components/trending-link';
import AccountContainer from '@/containers/account-container';
import StatusContainer from '@/containers/status-container';
import PlaceholderAccount from '@/features/placeholder/components/placeholder-account';
import PlaceholderHashtag from '@/features/placeholder/components/placeholder-hashtag';
import PlaceholderStatus from '@/features/placeholder/components/placeholder-status';
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
