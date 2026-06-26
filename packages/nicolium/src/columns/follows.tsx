import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import List, { ListItem } from '@/components/list';
import MissingIndicator from '@/components/missing-indicator';
import ScrollableList from '@/components/scrollable-list';
import Spinner from '@/components/ui/spinner';
import Toggle from '@/components/ui/toggle';
import { useFollowers, useFollowing, useSubscribers } from '@/queries/account-lists/use-follows';
import { useAccountLookup } from '@/queries/accounts/use-account-lookup';

interface IAccountListBody {
  hasAccount: boolean;
  isUnavailable?: boolean;
  isLoading?: boolean;
  isFetching?: boolean;
  accountIds: Array<string>;
  hasNextPage?: boolean;
  fetchNextPage: () => void;
  scrollKey: string;
  emptyMessage: React.ReactNode;
  prepend?: React.ReactNode;
}

const AccountListBody: React.FC<IAccountListBody> = ({
  hasAccount,
  isUnavailable,
  isLoading,
  isFetching,
  accountIds,
  hasNextPage,
  fetchNextPage,
  scrollKey,
  emptyMessage,
  prepend,
}) => {
  if (isLoading) {
    return <Spinner />;
  }

  if (!hasAccount) {
    return <MissingIndicator />;
  }

  if (isUnavailable) {
    return (
      <div className='empty-column-indicator'>
        <FormattedMessage
          id='empty_column.account_unavailable'
          defaultMessage='Profile unavailable'
        />
      </div>
    );
  }

  return (
    <>
      {prepend}
      <ScrollableList
        scrollKey={scrollKey}
        hasMore={hasNextPage}
        onLoadMore={fetchNextPage}
        emptyMessageText={emptyMessage}
        itemClassName='account-list__item'
        isLoading={isFetching}
      >
        {accountIds.map((accountId) => (
          <AccountContainer key={accountId} id={accountId} />
        ))}
      </ScrollableList>
    </>
  );
};

interface IFollowList {
  username: string;
}

/** List of accounts that follow the given account. */
const FollowersList: React.FC<IFollowList> = ({ username }) => {
  const { data: account, isUnavailable } = useAccountLookup(username);
  const {
    data = [],
    hasNextPage,
    fetchNextPage,
    isFetching,
    isLoading,
  } = useFollowers(account?.id);

  return (
    <AccountListBody
      hasAccount={!!account}
      isUnavailable={isUnavailable}
      isLoading={isLoading}
      isFetching={isFetching}
      accountIds={data}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      scrollKey='followers'
      emptyMessage={
        <FormattedMessage
          id='account.followers.empty'
          defaultMessage='No one follows this user yet.'
        />
      }
    />
  );
};

/** List of accounts the given account is following. */
const FollowingList: React.FC<IFollowList> = ({ username }) => {
  const { data: account, isUnavailable } = useAccountLookup(username);
  const {
    data = [],
    hasNextPage,
    fetchNextPage,
    isFetching,
    isLoading,
  } = useFollowing(account?.id);

  return (
    <AccountListBody
      hasAccount={!!account}
      isUnavailable={isUnavailable}
      isLoading={isLoading}
      isFetching={isFetching}
      accountIds={data}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      scrollKey='following'
      emptyMessage={
        <FormattedMessage
          id='account.follows.empty'
          defaultMessage='This user doesn’t follow anyone yet.'
        />
      }
    />
  );
};

/** List of accounts subscribing to the given account. */
const SubscribersList: React.FC<IFollowList> = ({ username }) => {
  const [includeExpired, setIncludeExpired] = useState(false);
  const { data: account, isUnavailable } = useAccountLookup(username);
  const {
    data = [],
    hasNextPage,
    fetchNextPage,
    isFetching,
    isLoading,
  } = useSubscribers(account?.id, includeExpired);

  return (
    <AccountListBody
      hasAccount={!!account}
      isUnavailable={isUnavailable}
      isLoading={isLoading}
      isFetching={isFetching}
      accountIds={data}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      scrollKey='subscribers'
      emptyMessage={
        <FormattedMessage
          id='account.subscribers.empty'
          defaultMessage='No one subscribes to this user yet.'
        />
      }
      prepend={
        <List>
          <ListItem
            className='subscribers__toggle'
            label={
              <FormattedMessage
                id='account.subscribers.include_expired'
                defaultMessage='Include expired subscriptions'
              />
            }
          >
            <Toggle
              checked={includeExpired}
              onChange={() => setIncludeExpired((value) => !value)}
            />
          </ListItem>
        </List>
      }
    />
  );
};

export { FollowersList, FollowingList, SubscribersList };
