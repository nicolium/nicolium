import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import MissingIndicator from '@/components/missing-indicator';
import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
import Spinner from '@/components/ui/spinner';
import { useFollowing } from '@/queries/account-lists/use-follows';
import { useAccountLookup } from '@/queries/accounts/use-account-lookup';
import { profileFollowingRoute } from '@/router';

const messages = defineMessages({
  heading: { id: 'column.following', defaultMessage: 'Following' },
});

/** Displays a list of accounts the given user is following. */
const FollowingPage: React.FC = () => {
  const { username } = profileFollowingRoute.useParams();

  const intl = useIntl();

  const { data: account, isUnavailable } = useAccountLookup(username);

  const {
    data = [],
    hasNextPage,
    fetchNextPage,
    isFetching,
    isLoading,
  } = useFollowing(account?.id);

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
        scrollKey='following'
        hasMore={hasNextPage}
        onLoadMore={fetchNextPage}
        emptyMessageText={
          <FormattedMessage
            id='account.follows.empty'
            defaultMessage='This user doesn’t follow anyone yet.'
          />
        }
        itemClassName='pb-4'
        isLoading={isFetching}
      >
        {data.map((accountId) => (
          <AccountContainer key={accountId} id={accountId} />
        ))}
      </ScrollableList>
    </Column>
  );
};

export { FollowingPage as default };
