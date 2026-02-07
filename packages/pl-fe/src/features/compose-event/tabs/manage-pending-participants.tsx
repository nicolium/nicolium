import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import ScrollableList from '@/components/scrollable-list';
import Button from '@/components/ui/button';
import HStack from '@/components/ui/hstack';
import Spinner from '@/components/ui/spinner';
import Stack from '@/components/ui/stack';
import AccountContainer from '@/containers/account-container';
import { useAcceptEventParticipationRequestMutation, useEventParticipationRequests, useRejectEventParticipationRequestMutation } from '@/queries/events/use-event-participation-requests';
import toast from '@/toast';

const messages = defineMessages({
  authorize: { id: 'compose_event.participation_requests.authorize', defaultMessage: 'Authorize' },
  authorizeSuccess: { id: 'compose_event.participation_requests.authorize.success', defaultMessage: 'Event participation request authorized successfully' },
  authorizeFail: { id: 'compose_event.participation_requests.authorize.fail', defaultMessage: 'Failed to authorize event participation request' },
  reject: { id: 'compose_event.participation_requests.reject', defaultMessage: 'Reject' },
  rejectSuccess: { id: 'compose_event.participation_requests.reject.success', defaultMessage: 'Event participation request rejected successfully' },
  rejectFail: { id: 'compose_event.participation_requests.reject.fail', defaultMessage: 'Failed to reject event participation request' },
});

interface IAccount {
  eventId: string;
  id: string;
  participationMessage: string | null;
}

const Account: React.FC<IAccount> = ({ eventId, id, participationMessage }) => {
  const intl = useIntl();

  const { mutate: acceptEventParticipationRequest } = useAcceptEventParticipationRequestMutation(eventId, id);
  const { mutate: rejectEventParticipationRequest } = useRejectEventParticipationRequestMutation(eventId, id);

  return (
    <AccountContainer
      id={id}
      note={participationMessage || undefined}
      action={
        <HStack space={2}>
          <Button
            theme='secondary'
            size='sm'
            text={intl.formatMessage(messages.authorize)}
            onClick={() => acceptEventParticipationRequest(undefined, {
              onSuccess: () => {
                toast.success(messages.authorizeSuccess);
              },
              onError: () => {
                toast.error(messages.authorizeFail);
              },
            })}
          />
          <Button
            theme='danger'
            size='sm'
            text={intl.formatMessage(messages.reject)}
            onClick={() => rejectEventParticipationRequest(undefined, {
              onSuccess: () => {
                toast.success(messages.rejectSuccess);
              },
              onError: () => {
                toast.error(messages.rejectFail);
              },
            })}
          />
        </HStack>
      }
    />
  );
};

interface IManagePendingParticipants {
  statusId: string;
}

const ManagePendingParticipants: React.FC<IManagePendingParticipants> = ({ statusId }) => {
  const { data: accounts, isLoading, hasNextPage, fetchNextPage } = useEventParticipationRequests(statusId);

  return accounts ? (
    <Stack space={3}>
      <ScrollableList
        scrollKey={`eventPendingParticipants:${statusId}`}
        emptyMessageText={<FormattedMessage id='empty_column.event_participant_requests' defaultMessage='There are no pending event participation requests.' />}
        hasMore={hasNextPage}
        isLoading={isLoading}
        onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
      >
        {accounts.map(({ account_id, participation_message }) =>
          <Account key={account_id} eventId={statusId!} id={account_id} participationMessage={participation_message} />,
        )}
      </ScrollableList>
    </Stack>
  ) : <Spinner />;
};

export { ManagePendingParticipants };
