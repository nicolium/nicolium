import { useNavigate, useRouter } from '@tanstack/react-router';
import clsx from 'clsx';
import range from 'lodash/range';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { usePrevious } from '@/hooks/use-previous';
import { usePersistDraftStatus } from '@/queries/statuses/use-draft-statuses';
import { useComposeStore } from '@/stores/compose';
import { useModalsActions } from '@/stores/modals';

import type { ModalType } from '@/features/ui/components/modal-root';
import type { Compose } from '@/stores/compose';

const messages = defineMessages({
  confirm: { id: 'confirmations.cancel.confirm', defaultMessage: 'Discard' },
  cancelEditing: { id: 'confirmations.cancel_editing.confirm', defaultMessage: 'Cancel editing' },
  saveDraft: { id: 'confirmations.cancel_editing.save_draft', defaultMessage: 'Save draft' },
});

const checkComposeContent = (compose?: Compose) =>
  !!compose &&
  [
    compose.editorState && compose.editorState.length > 0,
    compose.spoilerText.length > 0,
    compose.mediaAttachments.length > 0,
    compose.poll !== null,
  ].some((check) => check === true);

interface IModalRoot {
  onCancel?: () => void;
  onClose: (type?: ModalType, all?: boolean) => void;
  type: ModalType;
  children: React.ReactNode;
  modalIndex: number;
}

const ModalRoot: React.FC<IModalRoot> = ({ children, onCancel, onClose, type, modalIndex }) => {
  const intl = useIntl();
  const router = useRouter();
  const navigate = useNavigate();
  const persistDraftStatus = usePersistDraftStatus();
  const { openModal } = useModalsActions();

  const [revealed, setRevealed] = useState(!!children);

  const ref = useRef<HTMLDivElement>(null);
  const activeElement = useRef<HTMLDivElement | null>(
    revealed ? (document.activeElement as HTMLDivElement | null) : null,
  );
  const unlistenHistory = useRef<(() => void) | null>(null);

  const prevChildren = usePrevious(children);

  const visible = !!children;

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
      handleOnClose();
    }
  };

  const handleOnClose = () => {
    const { actions } = useComposeStore.getState();
    const compose = actions.getCompose('compose-modal');
    const hasComposeContent = checkComposeContent(compose);

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
        onSecondary: isEditing
          ? undefined
          : () => {
              persistDraftStatus('compose-modal');
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
    [...Array.from(ref.current!.parentElement!.childNodes)]
      .filter((node) => (node as HTMLDivElement).id !== '_rht_toaster')
      .filter((node) => node !== ref.current);

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
    if (!!children && !prevChildren) {
      activeElement.current = document.activeElement as HTMLDivElement;
      getSiblings().forEach((sibling) => {
        (sibling as HTMLDivElement).setAttribute('inert', 'true');
      });

      handleModalOpen();
    } else if (!prevChildren) {
      setRevealed(false);
    }

    if (!children && !!prevChildren) {
      activeElement.current?.focus();
      activeElement.current = null;
      getSiblings().forEach((sibling) => {
        (sibling as HTMLDivElement).removeAttribute('inert');
      });

      handleModalClose();
    }

    if (children) {
      requestAnimationFrame(() => {
        setRevealed(true);
      });

      ensureHistoryBuffer();
    }
  }, [children]);

  return (
    <div
      ref={ref}
      className={clsx('⁂-modal-root', {
        '⁂-modal-root--visible': visible,
        '⁂-modal-root--revealed': visible && revealed,
      })}
      data-modal-type={type}
    >
      {visible && (
        <>
          <div
            role='presentation'
            id='modal-overlay'
            className='⁂-modal-root__overlay'
            onClick={handleOnClose}
          />

          <div
            role={type === 'CONFIRM' ? 'alertdialog' : 'dialog'}
            className='⁂-modal-root__container'
            aria-modal
            aria-labelledby='modal-title'
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
};

export { checkComposeContent, ModalRoot as default };
