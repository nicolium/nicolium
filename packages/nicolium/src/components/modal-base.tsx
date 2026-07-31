import { useNavigate, useRouter } from '@tanstack/react-router';
import clsx from 'clsx';
import { range } from 'lodash-es';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { useColumnId } from '@/contexts/deck-column-id-context';
import { usePersistDraftStatus } from '@/queries/statuses/use-draft-statuses';
import { checkComposeContent, useComposeStore } from '@/stores/compose';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';

import type { ModalType } from '@/modals/modal-root';

const messages = defineMessages({
  confirm: { id: 'confirmations.cancel.confirm', defaultMessage: 'Discard' },
  cancelEditing: { id: 'confirmations.cancel_editing.confirm', defaultMessage: 'Cancel editing' },
  saveDraft: { id: 'confirmations.cancel_editing.save_draft', defaultMessage: 'Save draft' },
  draftSaved: { id: 'compose_form.save_draft.success', defaultMessage: 'Draft saved' },
  view: { id: 'toast.view', defaultMessage: 'View' },
});

interface IModalBase {
  onCancel?: () => void;
  onClose: (type?: ModalType, all?: boolean) => void;
  type: ModalType;
  children: React.ReactNode;
  modalIndex: number;
}

const ModalBase: React.FC<IModalBase> = ({ children, onCancel, onClose, type, modalIndex }) => {
  const intl = useIntl();
  const router = useRouter();
  const navigate = useNavigate();
  const persistDraftStatus = usePersistDraftStatus();
  const { openModal } = useModalsActions();
  const columnId = useColumnId();

  const [revealed, setRevealed] = useState(!!children);
  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const activeElement = useRef<HTMLDivElement | null>(
    revealed ? (document.activeElement as HTMLDivElement | null) : null,
  );
  const unlistenHistory = useRef<(() => void) | null>(null);

  const visible = !!children;

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
      handleOnClose();
    }
  };

  const handleOnClose = () => {
    const { actions } = useComposeStore.getState();
    const compose = actions.getCompose('compose-modal');
    const hasComposeContent =
      checkComposeContent(compose) || actions.hasThreadContent('compose-modal');

    if (hasComposeContent && type === 'COMPOSE') {
      const isEditing = compose.editedId !== null;
      openModal('CONFIRM', {
        heading: isEditing ? (
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
        message: isEditing ? (
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
        confirm: intl.formatMessage(messages.confirm),
        onConfirm: () => {
          onClose('COMPOSE');
          actions.resetCompose('compose-modal');
        },
        onCancel: () => {
          onClose('CONFIRM');
        },
        secondary: intl.formatMessage(messages.saveDraft),
        onSecondary:
          isEditing || actions.hasThreadPosts('compose-modal')
            ? undefined
            : () => {
                persistDraftStatus('compose-modal').then(() => {
                  toast.success(messages.draftSaved, {
                    actionLabel: messages.view,
                    actionLinkOptions: { to: '/draft_statuses' },
                    columnId,
                  });
                });
                onClose('COMPOSE');
                actions.resetCompose('compose-modal');
              },
      });
    } else if (hasComposeContent && type === 'CONFIRM') {
      onClose('CONFIRM');
    } else {
      onClose();
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      const focusable = Array.from(
        ref.current!.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((x) => window.getComputedStyle(x).display !== 'none');
      const index = focusable.indexOf(e.target as Element);

      let element;

      if (e.shiftKey) {
        element = focusable[index - 1] || focusable[focusable.length - 1];
      } else {
        element = focusable[index + 1] || focusable[0];
      }

      if (element) {
        (element as HTMLDivElement).focus();
        e.stopPropagation();
        e.preventDefault();
      }
    }
  }, []);

  const handleModalOpen = () => {
    unlistenHistory.current = router.history.subscribe(({ action, location }) => {
      if (
        (action.type === 'REPLACE' || action.type === 'PUSH') &&
        location.state.modalIndex === undefined
      ) {
        onClose(undefined, true);
      }
      if (action.type === 'BACK') {
        handleOnClose();

        if (onCancel) onCancel();
      }
    });
  };

  const handleModalClose = () => {
    if (unlistenHistory.current) {
      unlistenHistory.current();
    }
    if (router.state.location.state.modalIndex === modalIndex + 1) {
      router.history.go(-1);
    }
  };

  const ensureHistoryBuffer = () => {
    if (
      router.state.location.state.modalIndex === undefined ||
      router.state.location.state.modalIndex < modalIndex
    ) {
      range(router.state.location.state.modalIndex ?? -1, modalIndex).forEach((index) => {
        navigate({
          to: router.history.location.pathname,
          params: (prev) => prev,
          search: (prev) => prev,
          state: (prev) => ({ ...prev, modalIndex: index + 1 }),
        });
      });
    } else if (router.state.location.state.modalIndex > modalIndex) {
      router.history.go(-1);
    }
  };

  const getSiblings = () =>
    [...Array.from(document.querySelector('#app > .focusable')?.childNodes || [])].filter(
      (node) =>
        (node as HTMLDivElement).classList.contains('toast__container') === false &&
        (node as HTMLDivElement).classList.contains('modal-root') === false,
    );

  useEffect(() => {
    if (!visible) return;

    window.addEventListener('keyup', handleKeyUp, false);
    window.addEventListener('keydown', handleKeyDown, false);

    return () => {
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible]);

  useEffect(() => {
    if (children) {
      activeElement.current = document.activeElement as HTMLDivElement;
      getSiblings().forEach((sibling) => {
        (sibling as HTMLDivElement).setAttribute('inert', 'true');
      });

      handleModalOpen();

      requestAnimationFrame(() => {
        setRevealed(true);
      });

      ensureHistoryBuffer();
    }
  }, [!!children]);

  useEffect(() => {
    return () => {
      activeElement.current?.focus();
      activeElement.current = null;
      getSiblings().forEach((sibling) => {
        (sibling as HTMLDivElement).removeAttribute('inert');
      });

      handleModalClose();
    };
  }, []);

  useLayoutEffect(() => {
    setHasTitle(document.getElementById('modal-title') !== null);
    setHasDescription(document.getElementById('modal-description') !== null);
  }, [visible]);

  return (
    <div
      ref={ref}
      className={clsx('modal-root', {
        'modal-root--visible': visible,
        'modal-root--revealed': visible && revealed,
      })}
      data-modal-type={type}
    >
      {visible && (
        <>
          <div
            role='presentation'
            id='modal-overlay'
            className='modal-root__overlay'
            onClick={handleOnClose}
          />

          <div
            role={type === 'CONFIRM' ? 'alertdialog' : 'dialog'}
            className='modal-root__container'
            aria-modal
            aria-labelledby={hasTitle ? 'modal-title' : undefined}
            aria-describedby={hasDescription ? 'modal-description' : undefined}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
};

export { ModalBase as default };
