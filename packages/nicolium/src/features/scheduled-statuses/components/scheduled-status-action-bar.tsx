import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import Button from '@/components/ui/button';
import HStack from '@/components/ui/hstack';
import { cancelScheduledStatusMutationOptions } from '@/queries/statuses/scheduled-statuses';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';

import type { NormalizedStatus as StatusEntity } from '@/normalizers/status';

const messages = defineMessages({
  cancel: { id: 'scheduled_status.cancel', defaultMessage: 'Cancel' },
  deleteConfirm: { id: 'confirmations.scheduled_status_delete.confirm', defaultMessage: 'Discard' },
  deleteHeading: {
    id: 'confirmations.scheduled_status_delete.heading',
    defaultMessage: 'Cancel scheduled post',
  },
  deleteMessage: {
    id: 'confirmations.scheduled_status_delete.message',
    defaultMessage: 'Are you sure you want to discard this scheduled post?',
  },
});

interface IScheduledStatusActionBar {
  status: StatusEntity;
}

const ScheduledStatusActionBar: React.FC<IScheduledStatusActionBar> = ({ status }) => {
  const intl = useIntl();

  const { mutate: cancelScheduledStatus } = useMutation(
    cancelScheduledStatusMutationOptions(status.id),
  );
  const { openModal } = useModalsActions();
  const settings = useSettings();

  const handleCancelClick = () => {
    const deleteModal = settings.deleteModal;
    if (!deleteModal) {
      cancelScheduledStatus();
    } else {
      openModal('CONFIRM', {
        heading: intl.formatMessage(messages.deleteHeading),
        message: intl.formatMessage(messages.deleteMessage),
        confirm: intl.formatMessage(messages.deleteConfirm),
        onConfirm: () => {
          cancelScheduledStatus();
        },
      });
    }
  };

  return (
    <HStack justifyContent='end'>
      <Button theme='danger' size='sm' onClick={handleCancelClick}>
        <FormattedMessage id='scheduled_status.cancel' defaultMessage='Cancel' />
      </Button>
    </HStack>
  );
};

export { ScheduledStatusActionBar as default };
