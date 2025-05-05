import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { useAccountLookup } from 'pl-fe/api/hooks/accounts/use-account-lookup';
import MissingIndicator from 'pl-fe/components/missing-indicator';
import ScrollableList from 'pl-fe/components/scrollable-list';
import Column from 'pl-fe/components/ui/column';
import Spinner from 'pl-fe/components/ui/spinner';
import AccountContainer from 'pl-fe/containers/account-container';
import { useFollowers } from 'pl-fe/queries/account-lists/use-follows';

const messages = defineMessages({
  heading: { id: 'column.followers', defaultMessage: 'Followers' },
});

interface IFollowers {
  params?: {
    username?: string;
  };
}

/** Displays a list of accounts who follow the given account. */
const Followers: React.FC<IFollowers> = ({ params }) => {
  const intl = useIntl();

  const { account, isUnavailable } = useAccountLookup(params?.username);

  const {
    data = [],
    hasNextPage,
    fetchNextPage,
    isFetching,
    isLoading,
  } = useFollowers(account?.id);

  if (isLoading) {
    return (
      <Spinner />
    );
  }

  if (!account) {
    return (
      <MissingIndicator />
    );
  }

  if (isUnavailable) {
    return (
      <div className='empty-column-indicator'>
        <FormattedMessage id='empty_column.account_unavailable' defaultMessage='Profile unavailable' />
      </div>
    );
  }

  return (
    <Column label={intl.formatMessage(messages.heading)} transparent>
      <ScrollableList
        scrollKey='followers'
        hasMore={hasNextPage}
        onLoadMore={fetchNextPage}
        emptyMessage={<FormattedMessage id='account.followers.empty' defaultMessage='No one follows this user yet.' />}
        itemClassName='pb-4'
        isLoading={isFetching}
      >
        {data.map((accountId) => (
          <AccountContainer
            key={accountId}
            id={accountId}
          />
        ))}
      </ScrollableList>
    </Column>
  );
};

export { Followers as default };
