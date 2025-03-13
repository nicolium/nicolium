import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import ScrollableList from 'pl-fe/components/scrollable-list';
import Column from 'pl-fe/components/ui/column';
import Spinner from 'pl-fe/components/ui/spinner';
import AccountContainer from 'pl-fe/containers/account-container';
import { useOutgoingFollowRequests } from 'pl-fe/queries/accounts/use-follow-requests';

import FollowRequestsTabs from './follow-requests-tabs';

const messages = defineMessages({
  heading: { id: 'column.outgoing_follow_requests', defaultMessage: 'Outgoing follow requests' },
});

const OutgoingFollowRequests: React.FC = () => {
  const intl = useIntl();

  const { data: accountIds, isLoading, hasNextPage, fetchNextPage } = useOutgoingFollowRequests();

  const body = accountIds ? (
    <ScrollableList
      hasMore={hasNextPage}
      isLoading={typeof isLoading === 'boolean' ? isLoading : true}
      onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
      emptyMessage={<FormattedMessage id='empty_column.outgoing_follow_requests' defaultMessage="You don't have any outgoing follow requests yet. When you try to follow a user, it will show up here." />}
      itemClassName='p-2.5'
    >
      {accountIds.map(id =>
        <AccountContainer key={id} id={id} />,
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

export { OutgoingFollowRequests as default };
