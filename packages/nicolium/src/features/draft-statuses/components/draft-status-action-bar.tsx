import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { fetchStatus } from '@/actions/statuses';
import { useClient } from '@/hooks/use-client';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { scopedQueryKey } from '@/queries/query';
import { useCancelDraftStatus } from '@/queries/statuses/use-draft-statuses';
import { openDedicatedComposeWindow, useComposeActions } from '@/stores/compose';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';
import { userTouching } from '@/utils/is-mobile';

import type { NormalizedStatus as StatusEntity } from '@/queries/statuses/normalize';
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
  const scopeUrl = useScopeUrl();

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
    if (settings.useDedicatedComposePage && !userTouching.matches) {
      openDedicatedComposeWindow({ draftId: source.draft_id });
      return;
    }

    if (status.in_reply_to_id) fetchStatus(client, status.in_reply_to_id, scopeUrl);
    const poll = status.poll_id
      ? queryClient.getQueryData(
          scopedQueryKey(queryKeys.statuses.polls.show(status.poll_id), scopeUrl),
        )
      : undefined;
    setComposeToStatus(
      status,
      poll,
      { ...source, location: null },
      false,
      source.draft_id,
      source.editorState,
    );
    openModal('COMPOSE');
  };

  return (
    <div className='draft-status__actions'>
      <button onClick={handleEditClick}>
        <FormattedMessage id='draft_status.edit' defaultMessage='Edit' />
      </button>
      <button onClick={handleCancelClick}>
        <FormattedMessage id='draft_status.cancel' defaultMessage='Delete' />
      </button>
    </div>
  );
};

export { DraftStatusActionBar as default };
