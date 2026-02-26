import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { fetchStatus } from '@/actions/statuses';
import Button from '@/components/ui/button';
import HStack from '@/components/ui/hstack';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useCancelDraftStatus } from '@/queries/statuses/use-draft-statuses';
import { useComposeActions } from '@/stores/compose';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';

import type { DraftStatus } from '@/queries/statuses/use-draft-statuses';
import type { NormalizedStatus as StatusEntity } from '@/reducers/statuses';

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

  const { openModal } = useModalsActions();
  const { setComposeToStatus } = useComposeActions();
  const settings = useSettings();
  const dispatch = useAppDispatch();
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
    if (status.in_reply_to_id) dispatch(fetchStatus(status.in_reply_to_id));
    setComposeToStatus(status, status.poll, source, false, source.draft_id, source.editorState);
    openModal('COMPOSE');
  };

  return (
    <HStack space={2} justifyContent='end'>
      <Button theme='primary' size='sm' onClick={handleEditClick}>
        <FormattedMessage id='draft_status.edit' defaultMessage='Edit' />
      </Button>
      <Button theme='danger' size='sm' onClick={handleCancelClick}>
        <FormattedMessage id='draft_status.cancel' defaultMessage='Delete' />
      </Button>
    </HStack>
  );
};

export { DraftStatusActionBar as default };
