import clsx from 'clsx';
import React, { useRef } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { ComposeForm } from '@/components/async-components';
import Modal from '@/components/ui/modal';
import { useColumnId } from '@/contexts/deck-column-id-context';
import { useComposeHeading } from '@/hooks/use-compose-heading';
import { useDraggedFiles } from '@/hooks/use-dragged-files';
import { usePersistDraftStatus } from '@/queries/statuses/use-draft-statuses';
import {
  checkComposeContent,
  useCompose,
  useComposeActions,
  useUploadCompose,
} from '@/stores/compose';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';

import type { BaseModalProps } from '@/modals/modal-root';

const messages = defineMessages({
  confirm: { id: 'confirmations.cancel.confirm', defaultMessage: 'Discard' },
  cancelEditing: { id: 'confirmations.cancel_editing.confirm', defaultMessage: 'Cancel editing' },
  saveDraft: { id: 'confirmations.cancel_editing.save_draft', defaultMessage: 'Save draft' },
  draftSaved: { id: 'compose_form.save_draft.success', defaultMessage: 'Draft saved' },
  view: { id: 'toast.view', defaultMessage: 'View' },
});

interface ComposeModalProps {
  composeId?: string;
}

const ComposeModal: React.FC<BaseModalProps & ComposeModalProps> = ({
  onClose,
  composeId = 'compose-modal',
}) => {
  const intl = useIntl();
  const node = useRef<HTMLDivElement>(null);
  const compose = useCompose(composeId);
  const uploadCompose = useUploadCompose(composeId);
  const { resetCompose, hasThreadContent, hasThreadPosts } = useComposeActions();
  const { openModal } = useModalsActions();
  const persistDraftStatus = usePersistDraftStatus();
  const columnId = useColumnId();

  const { editedId } = compose;
  const title = useComposeHeading(composeId);

  const { isDragging, isDraggedOver } = useDraggedFiles(node, (files) => {
    uploadCompose(files);
  });

  const onClickClose = () => {
    if (checkComposeContent(compose) || hasThreadContent(composeId)) {
      openModal('CONFIRM', {
        heading: editedId ? (
          <FormattedMessage
            id='confirmations.cancel_editing.heading'
            defaultMessage='Cancel post editing'
          />
        ) : compose.draftId ? (
          <FormattedMessage
            id='confirmations.cancel_draft.heading'
            defaultMessage='Discard draft changes'
          />
        ) : (
          <FormattedMessage id='confirmations.cancel.heading' defaultMessage='Discard post' />
        ),
        message: editedId ? (
          <FormattedMessage
            id='confirmations.cancel_editing.message'
            defaultMessage='Are you sure you want to discard the changes to this post? All changes will be lost.'
          />
        ) : compose.draftId ? (
          <FormattedMessage
            id='confirmations.cancel_draft_editing.message'
            defaultMessage='Are you sure you want to discard the changes to this draft post? All changes will be lost.'
          />
        ) : (
          <FormattedMessage
            id='confirmations.cancel.message'
            defaultMessage='Are you sure you want to discard the currently composed post?'
          />
        ),
        confirm: intl.formatMessage(editedId ? messages.cancelEditing : messages.confirm),
        onConfirm: () => {
          onClose('COMPOSE');
          resetCompose('compose-modal');
        },
        secondary: intl.formatMessage(messages.saveDraft),
        onSecondary:
          editedId || hasThreadPosts(composeId)
            ? undefined
            : () => {
                persistDraftStatus(composeId).then(() => {
                  toast.success(messages.draftSaved, {
                    actionLabel: messages.view,
                    actionLinkOptions: { to: '/draft_statuses' },
                    columnId,
                  });
                });
                onClose('COMPOSE');
                resetCompose('compose-modal');
              },
      });
    } else {
      onClose('COMPOSE');
    }
  };

  return (
    <Modal
      ref={node}
      title={title}
      onClose={onClickClose}
      className={clsx('compose-modal', {
        'compose-modal--dragging': isDragging,
        'compose-modal--dragged-over': isDraggedOver,
      })}
    >
      <ComposeForm
        id={composeId}
        autoFocus
        showAccountSwitcher
        enableThread={!editedId && !compose.redacting}
      />
    </Modal>
  );
};

export { type ComposeModalProps, ComposeModal as default };
