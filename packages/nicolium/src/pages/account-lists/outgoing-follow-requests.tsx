import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
import Spinner from '@/components/ui/spinner';
import { useOutgoingFollowRequests } from '@/queries/accounts/use-follow-requests';

import { FollowRequestsTabs } from './follow-requests';

const messages = defineMessages({
  heading: { id: 'column.outgoing_follow_requests', defaultMessage: 'Outgoing follow requests' },
});

const OutgoingFollowRequestsPage: React.FC = () => {
  const intl = useIntl();

  const { data: accountIds, isLoading, hasNextPage, fetchNextPage } = useOutgoingFollowRequests();

  const body = accountIds ? (
    <ScrollableList
      scrollKey='outgoingFollowRequests'
      hasMore={hasNextPage}
      isLoading={isLoading}
      onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
      emptyMessageText={
        <FormattedMessage
          id='empty_column.outgoing_follow_requests'
          defaultMessage="You don't have any outgoing follow requests yet. When you try to follow a user, it will show up here."
        />
      }
      itemClassName='p-2.5'
    >
      {accountIds.map((id) => (
        <AccountContainer key={id} id={id} />
      ))}
    </ScrollableList>
  ) : (
    <Spinner />
  );

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <FollowRequestsTabs />

      {body}
    </Column>
  );
};

export { OutgoingFollowRequestsPage as default };
