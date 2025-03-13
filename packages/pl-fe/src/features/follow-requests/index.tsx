import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import ScrollableList from 'pl-fe/components/scrollable-list';
import Column from 'pl-fe/components/ui/column';
import Spinner from 'pl-fe/components/ui/spinner';
import { useFollowRequests } from 'pl-fe/queries/accounts/use-follow-requests';

import AccountAuthorize from './components/account-authorize';
import FollowRequestsTabs from './components/follow-requests-tabs';

const messages = defineMessages({
  heading: { id: 'column.follow_requests', defaultMessage: 'Follow requests' },
});

const FollowRequests: React.FC = () => {
  const intl = useIntl();

  const { data: accountIds, isLoading, hasNextPage, fetchNextPage } = useFollowRequests();

  const body = accountIds ? (
    <ScrollableList
      hasMore={hasNextPage}
      isLoading={typeof isLoading === 'boolean' ? isLoading : true}
      onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
      emptyMessage={<FormattedMessage id='empty_column.follow_requests' defaultMessage="You don't have any follow requests yet. When you receive one, it will show up here." />}
    >
      {accountIds.map(id =>
        <AccountAuthorize key={id} id={id} />,
      )}
    </ScrollableList>
  ) : <Spinner />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <FollowRequestsTabs />

      {body}
    </Column>
  );
};

export { FollowRequests as default };
