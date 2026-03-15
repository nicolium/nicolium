import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { fetchStatus } from '@/actions/statuses';
import Button from '@/components/ui/button';
import { useClient } from '@/hooks/use-client';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { useCancelDraftStatus } from '@/queries/statuses/use-draft-statuses';
import { useComposeActions } from '@/stores/compose';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';

import type { NormalizedStatus as StatusEntity } from '@/normalizers/status';
import type { DraftStatus } from '@/queries/statuses/use-draft-statuses';

const messages = defineMessages({
  deleteConfirm: { id: 'confirmations.draft_status_delete.confirm', defaultMessage: 'Discard' },
  deleteHeading: {
    id: 'confirmations.draft_status_delete.heading',
    defaultMessage: 'Cancel draft post',
  },
  deleteMessage: {
    id: 'confirmations.draft_status_delete.message',
    defaultMessage: 'Are you sure you want to discard this draft post?',
  },
});

interface IDraftStatusActionBar {
  source: DraftStatus;
  status: StatusEntity;
}

const DraftStatusActionBar: React.FC<IDraftStatusActionBar> = ({ source, status }) => {
  const intl = useIntl();
  const client = useClient();

  const { openModal } = useModalsActions();
  const { setComposeToStatus } = useComposeActions();
  const settings = useSettings();
  const cancelDraftStatus = useCancelDraftStatus();

  const handleCancelClick = () => {
    const deleteModal = settings.deleteModal;
    if (!deleteModal) {
      cancelDraftStatus(source.draft_id);
    } else {
      openModal('CONFIRM', {
        heading: intl.formatMessage(messages.deleteHeading),
        message: intl.formatMessage(messages.deleteMessage),
        confirm: intl.formatMessage(messages.deleteConfirm),
        onConfirm: () => cancelDraftStatus(source.draft_id),
      });
    }
  };

  const handleEditClick = () => {
    if (status.in_reply_to_id) fetchStatus(client, status.in_reply_to_id);
    const poll = status.poll_id
      ? queryClient.getQueryData(queryKeys.statuses.polls.show(status.poll_id))
      : undefined;
    setComposeToStatus(status, poll, source, false, source.draft_id, source.editorState);
    openModal('COMPOSE');
  };

  return (
    <div className='flex justify-end gap-2'>
      <Button theme='primary' size='sm' onClick={handleEditClick}>
        <FormattedMessage id='draft_status.edit' defaultMessage='Edit' />
      </Button>
      <Button theme='danger' size='sm' onClick={handleCancelClick}>
        <FormattedMessage id='draft_status.cancel' defaultMessage='Delete' />
      </Button>
    </div>
  );
};

export { DraftStatusActionBar as default };
