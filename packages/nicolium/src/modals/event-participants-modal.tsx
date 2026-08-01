import React from 'react';
import { FormattedMessage } from 'react-intl';

import AccountList from '@/components/accounts/account-list';
import Modal from '@/components/ui/modal';
import { useEventParticipations } from '@/queries/events/use-event-participations';

import type { BaseModalProps } from '@/modals/modal-root';

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

  return (
    <Modal
      title={
        <FormattedMessage id='column.event_participants' defaultMessage='Event participants' />
      }
      onClose={() => onClose('EVENT_PARTICIPANTS')}
    >
      <AccountList
        accountIds={accountIds}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        fetchNextPage={() => fetchNextPage({ cancelRefetch: false })}
        refetch={refetch}
        emptyMessage={
          <FormattedMessage
            id='empty_column.event_participants'
            defaultMessage='No one joined this event yet. When someone does, they will show up here.'
          />
        }
      />
    </Modal>
  );
};

export { EventParticipantsModal as default, type EventParticipantsModalProps };
