import { useMatch } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import Account from 'pl-fe/components/account';
import { AuthorizeRejectButtons } from 'pl-fe/components/authorize-reject-buttons';
import ScrollableList from 'pl-fe/components/scrollable-list';
import Column from 'pl-fe/components/ui/column';
import Spinner from 'pl-fe/components/ui/spinner';
import Tabs, { type Item } from 'pl-fe/components/ui/tabs';
import { followRequestsRoute } from 'pl-fe/features/ui/router';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useAcceptFollowRequestMutation, useFollowRequests, useRejectFollowRequestMutation } from 'pl-fe/queries/accounts/use-follow-requests';

const messages = defineMessages({
  heading: { id: 'column.follow_requests', defaultMessage: 'Follow requests' },
  followRequests: { id: 'column.follow_requests', defaultMessage: 'Follow requests' },
  outgoingFollowRequests: { id: 'column.outgoing_follow_requests', defaultMessage: 'Outgoing follow requests' },
});

interface IAccountAuthorize {
  id: string;
}

const AccountAuthorize: React.FC<IAccountAuthorize> = ({ id }) => {
  const { account } = useAccount(id);

  const { mutate: authorizeFollowRequest } = useAcceptFollowRequestMutation(id);
  const { mutate: rejectFollowRequest } = useRejectFollowRequestMutation(id);

  const onAuthorize = () => authorizeFollowRequest();
  const onReject = () => rejectFollowRequest();

  if (!account) return null;

  return (
    <div className='p-2.5'>
      <Account
        account={account}
        action={
          <AuthorizeRejectButtons
            onAuthorize={onAuthorize}
            onReject={onReject}
            countdown={3000}
          />
        }
      />
    </div>
  );
};

const FollowRequestsTabs = () => {
  const intl = useIntl();
  const match = useMatch({ from: followRequestsRoute.id, shouldThrow: false });
  const features = useFeatures();

  if (!features.outgoingFollowRequests) {
    return null;
  }

  const tabs: Array<Item> = [{
    name: '/follow_requests',
    text: intl.formatMessage(messages.followRequests),
    to: '/follow_requests',
  }, {
    name: '/outgoing_follow_requests',
    text: intl.formatMessage(messages.outgoingFollowRequests),
    to: '/outgoing_follow_requests',
  }];

  return <Tabs items={tabs} activeItem={match ? '/follow_requests' : '/outgoing_follow_requests'} />;
};

const FollowRequestsPage: React.FC = () => {
  const intl = useIntl();

  const { data: accountIds, isLoading, hasNextPage, fetchNextPage } = useFollowRequests();

  const body = accountIds ? (
    <ScrollableList
      scrollKey='followRequests'
      hasMore={hasNextPage}
      isLoading={isLoading}
      onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
      emptyMessageText={<FormattedMessage id='empty_column.follow_requests' defaultMessage="You don't have any follow requests yet. When you receive one, it will show up here." />}
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

export { FollowRequestsPage as default, FollowRequestsTabs };
