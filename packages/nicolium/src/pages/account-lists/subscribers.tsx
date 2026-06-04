import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import List, { ListItem } from '@/components/list';
import MissingIndicator from '@/components/missing-indicator';
import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
import Spinner from '@/components/ui/spinner';
import Toggle from '@/components/ui/toggle';
import { useSubscribers } from '@/queries/account-lists/use-follows';
import { useAccountLookup } from '@/queries/accounts/use-account-lookup';
import { profileSubscribersRoute } from '@/router';

const messages = defineMessages({
  heading: { id: 'column.subscribers', defaultMessage: 'Subscribers' },
});

/** Displays a list of accounts subscribing the given account. */
const SubscribersPage: React.FC = () => {
  const navigate = useNavigate({ from: profileSubscribersRoute.fullPath });
  const { username } = profileSubscribersRoute.useParams();
  const { include_expired: includeExpired } = profileSubscribersRoute.useSearch();

  const intl = useIntl();

  const { data: account, isUnavailable } = useAccountLookup(username);

  const {
    data = [],
    hasNextPage,
    fetchNextPage,
    isFetching,
    isLoading,
  } = useSubscribers(account?.id, includeExpired);

  if (isLoading) {
    return <Spinner />;
  }

  if (!account) {
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
    <Column label={intl.formatMessage(messages.heading)} transparent>
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
            onChange={() => navigate({ search: { include_expired: !includeExpired } })}
          />
        </ListItem>
      </List>

      <ScrollableList
        scrollKey='subscribers'
        hasMore={hasNextPage}
        onLoadMore={fetchNextPage}
        emptyMessageText={
          <FormattedMessage
            id='account.subscribers.empty'
            defaultMessage='No one subscribes to this user yet.'
          />
        }
        itemClassName='account-list__item'
        isLoading={isFetching}
      >
        {data.map((accountId) => (
          <AccountContainer key={accountId} id={accountId} />
        ))}
      </ScrollableList>
    </Column>
  );
};

export { SubscribersPage as default };
