import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import MissingIndicator from '@/components/missing-indicator';
import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
import Spinner from '@/components/ui/spinner';
import { useFollowers } from '@/queries/account-lists/use-follows';
import { useAccountLookup } from '@/queries/accounts/use-account-lookup';
import { profileFollowersRoute } from '@/router';

const messages = defineMessages({
  heading: { id: 'column.followers', defaultMessage: 'Followers' },
});

/** Displays a list of accounts who follow the given account. */
const FollowersPage: React.FC = () => {
  const { username } = profileFollowersRoute.useParams();

  const intl = useIntl();

  const { data: account, isUnavailable } = useAccountLookup(username);

  const {
    data = [],
    hasNextPage,
    fetchNextPage,
    isFetching,
    isLoading,
  } = useFollowers(account?.id);

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
      <ScrollableList
        scrollKey='followers'
        hasMore={hasNextPage}
        onLoadMore={fetchNextPage}
        emptyMessageText={
          <FormattedMessage
            id='account.followers.empty'
            defaultMessage='No one follows this user yet.'
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

export { FollowersPage as default };
