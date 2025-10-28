import clsx from 'clsx';
import React, { useRef } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { cancelReplyCompose, uploadCompose } from 'pl-fe/actions/compose';
import { checkComposeContent } from 'pl-fe/components/modal-root';
import Modal from 'pl-fe/components/ui/modal';
import { ComposeForm } from 'pl-fe/features/ui/util/async-components';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useCompose } from 'pl-fe/hooks/use-compose';
import { useDraggedFiles } from 'pl-fe/hooks/use-dragged-files';
import { usePersistDraftStatus } from 'pl-fe/queries/statuses/use-draft-statuses';
import { useModalsActions } from 'pl-fe/stores/modals';

import type { BaseModalProps } from 'pl-fe/features/ui/components/modal-root';

const messages = defineMessages({
  confirm: { id: 'confirmations.cancel.confirm', defaultMessage: 'Discard' },
  cancelEditing: { id: 'confirmations.cancel_editing.confirm', defaultMessage: 'Cancel editing' },
  saveDraft: { id: 'confirmations.cancel_editing.save_draft', defaultMessage: 'Save draft' },
});

interface ComposeModalProps {
  composeId?: string;
}

const ComposeModal: React.FC<BaseModalProps & ComposeModalProps> = ({ onClose, composeId = 'compose-modal' }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const node = useRef<HTMLDivElement>(null);
  const compose = useCompose(composeId);
  const { openModal } = useModalsActions();
  const persistDraftStatus = usePersistDraftStatus();

  const { id: statusId, visibility, inReplyToId, quote, groupId } = compose;

  const { isDragging, isDraggedOver } = useDraggedFiles(node, (files) => {
    dispatch(uploadCompose(composeId, files, intl));
  });

  const onClickClose = () => {
    if (checkComposeContent(compose)) {
      openModal('CONFIRM', {
        heading: statusId
          ? <FormattedMessage id='confirmations.cancel_editing.heading' defaultMessage='Cancel post editing' />
          : compose.draftId
            ? <FormattedMessage id='confirmations.cancel_draft.heading' defaultMessage='Discard draft changes' />
            : <FormattedMessage id='confirmations.cancel.heading' defaultMessage='Discard post' />,
        message: statusId
          ? <FormattedMessage id='confirmations.cancel_editing.message' defaultMessage='Are you sure you want to cancel editing this post? All changes will be lost.' />
          : compose.draftId
            ? <FormattedMessage id='confirmations.cancel_draft_editing.message' defaultMessage='Are you sure you want to cancel editing this draft post? All changes will be lost.' />
            : <FormattedMessage id='confirmations.cancel.message' defaultMessage='Are you sure you want to cancel creating this post?' />,
        confirm: intl.formatMessage(statusId ? messages.cancelEditing : messages.confirm),
        onConfirm: () => {
          onClose('COMPOSE');
          dispatch(cancelReplyCompose());
        },
        secondary: intl.formatMessage(messages.saveDraft),
        onSecondary: statusId ? undefined : () => {
          persistDraftStatus(composeId);
          onClose('COMPOSE');
          dispatch(cancelReplyCompose());
        },
      });
    } else {
      onClose('COMPOSE');
    }
  };

  const renderTitle = () => {
    if (compose.draftId) {
      return <FormattedMessage id='navigation_bar.compose_draft' defaultMessage='Edit draft post' />;
    } else if (compose.redacting) {
      return <FormattedMessage id='navigation_bar.compose_redact' defaultMessage='Redact post' />;
    } else if (statusId) {
      return <FormattedMessage id='navigation_bar.compose_edit' defaultMessage='Edit post' />;
    } else if (visibility === 'direct') {
      return <FormattedMessage id='navigation_bar.compose_direct' defaultMessage='Direct message' />;
    } else if (inReplyToId && groupId) {
      return <FormattedMessage id='navigation_bar.compose_group_reply' defaultMessage='Reply to group post' />;
    } else if (groupId) {
      return <FormattedMessage id='navigation_bar.compose_group' defaultMessage='Compose to group' />;
    } else if (inReplyToId) {
      return <FormattedMessage id='navigation_bar.compose_reply' defaultMessage='Reply to post' />;
    } else if (quote) {
      return <FormattedMessage id='navigation_bar.compose_quote' defaultMessage='Quote post' />;
    } else {
      return <FormattedMessage id='navigation_bar.compose' defaultMessage='Compose a post' />;
    }
  };

  return (
    <Modal
      ref={node}
      title={renderTitle()}
      onClose={onClickClose}
      className={clsx({
        'border-2 border-primary-600 border-dashed !z-[99]': isDragging,
        'ring-2 ring-offset-2 ring-primary-600': isDraggedOver,
      })}
    >
      <ComposeForm id={composeId} autoFocus />
    </Modal>
  );
};

export { type ComposeModalProps, ComposeModal as default };
