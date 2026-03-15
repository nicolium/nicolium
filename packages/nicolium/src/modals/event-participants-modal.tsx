import React from 'react';
import { FormattedMessage } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import PullToRefresh from '@/components/pull-to-refresh';
import ScrollableList from '@/components/scrollable-list';
import Modal from '@/components/ui/modal';
import Spinner from '@/components/ui/spinner';
import { useEventParticipations } from '@/queries/events/use-event-participations';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

interface EventParticipantsModalProps {
  statusId: string;
}

const EventParticipantsModal: React.FC<BaseModalProps & EventParticipantsModalProps> = ({
  onClose,
  statusId,
}) => {
  const {
    data: accountIds,
    isLoading,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useEventParticipations(statusId);

  const onClickClose = () => {
    onClose('EVENT_PARTICIPANTS');
  };

  let body;

  if (!accountIds) {
    body = <Spinner />;
  } else {
    const emptyMessage = (
      <FormattedMessage
        id='empty_column.event_participants'
        defaultMessage='No one joined this event yet. When someone does, they will show up here.'
      />
    );

    body = (
      <PullToRefresh onRefresh={refetch}>
        <ScrollableList
          emptyMessageText={emptyMessage}
          listClassName='max-w-full'
          itemClassName='pb-3'
          style={{ height: 'calc(80vh - 88px)' }}
          hasMore={hasNextPage}
          isLoading={isLoading}
          onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
          useWindowScroll={false}
        >
          {accountIds.map((id) => (
            <AccountContainer key={id} id={id} />
          ))}
        </ScrollableList>
      </PullToRefresh>
    );
  }

  return (
    <Modal
      title={
        <FormattedMessage id='column.event_participants' defaultMessage='Event participants' />
      }
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export { EventParticipantsModal as default, type EventParticipantsModalProps };
