import clsx from 'clsx';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { cancelReplyCompose } from 'pl-fe/actions/compose';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { usePrevious } from 'pl-fe/hooks/use-previous';
import { usePersistDraftStatus } from 'pl-fe/queries/statuses/use-draft-statuses';
import { useModalsActions } from 'pl-fe/stores/modals';

import type { ModalType } from 'pl-fe/features/ui/components/modal-root';
import type { Compose } from 'pl-fe/reducers/compose';

const messages = defineMessages({
  confirm: { id: 'confirmations.cancel.confirm', defaultMessage: 'Discard' },
  cancelEditing: { id: 'confirmations.cancel_editing.confirm', defaultMessage: 'Cancel editing' },
  saveDraft: { id: 'confirmations.cancel_editing.save_draft', defaultMessage: 'Save draft' },
});

const checkComposeContent = (compose?: Compose) =>
  !!compose && [
    compose.editorState && compose.editorState.length > 0,
    compose.spoiler_text.length > 0,
    compose.media_attachments.length > 0,
    compose.poll !== null,
  ].some(check => check === true);

interface IModalRoot {
  onCancel?: () => void;
  onClose: (type?: ModalType) => void;
  type: ModalType;
  children: React.ReactNode;
}

const ModalRoot: React.FC<IModalRoot> = ({ children, onCancel, onClose, type }) => {
  const intl = useIntl();
  const history = useHistory();
  const dispatch = useAppDispatch();

  const persistDraftStatus = usePersistDraftStatus();
  const { openModal } = useModalsActions();

  const [revealed, setRevealed] = useState(!!children);

  const ref = useRef<HTMLDivElement>(null);
  const activeElement = useRef<HTMLDivElement | null>(revealed ? document.activeElement as HTMLDivElement | null : null);
  const modalHistoryKey = useRef<number>();
  const unlistenHistory = useRef<ReturnType<typeof history.listen>>();

  const prevChildren = usePrevious(children);

  const visible = !!children;

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
      handleOnClose();
    }
  };

  const handleOnClose = () => {
    dispatch((_, getState) => {
      const compose = getState().compose['compose-modal'];
      const hasComposeContent = checkComposeContent(compose);

      if (hasComposeContent && type === 'COMPOSE') {
        const isEditing = compose!.id !== null;
        openModal('CONFIRM', {
          heading: isEditing
            ? <FormattedMessage id='confirmations.cancel_editing.heading' defaultMessage='Cancel post editing' />
            : compose.draft_id
              ? <FormattedMessage id='confirmations.cancel_draft.heading' defaultMessage='Discard draft changes' />
              : <FormattedMessage id='confirmations.cancel.heading' defaultMessage='Discard post' />,
          message: isEditing
            ? <FormattedMessage id='confirmations.cancel_editing.message' defaultMessage='Are you sure you want to discard the changes to this post? All changes will be lost.' />
            : compose.draft_id
              ? <FormattedMessage id='confirmations.cancel_draft_editing.message' defaultMessage='Are you sure you want to discard the changes to this draft post? All changes will be lost.' />
              : <FormattedMessage id='confirmations.cancel.message' defaultMessage='Are you sure you want to discard the currently composed post?' />,
          confirm: intl.formatMessage(messages.confirm),
          onConfirm: () => {
            onClose('COMPOSE');
            dispatch(cancelReplyCompose());
          },
          onCancel: () => {
            onClose('CONFIRM');
          },
          secondary: intl.formatMessage(messages.saveDraft),
          onSecondary: isEditing ? undefined : () => {
            persistDraftStatus('compose-modal');
            onClose('COMPOSE');
            dispatch(cancelReplyCompose());
          },
        });
      } else if (hasComposeContent && type === 'CONFIRM') {
        onClose('CONFIRM');
      } else {
        onClose();
      }
    });
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      const focusable = Array.from(ref.current!.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((x) => window.getComputedStyle(x).display !== 'none');
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
    modalHistoryKey.current = Date.now();
    unlistenHistory.current = history.listen(({ state }, action) => {
      if (!(state as any)?.plFeModalKey) {
        onClose();
      } else if (action === 'POP') {
        handleOnClose();

        if (onCancel) onCancel();
      }
    });
  };

  const handleModalClose = () => {
    if (unlistenHistory.current) {
      unlistenHistory.current();
    }
    const { state } = history.location;
    if (state && (state as any).plFeModalKey === modalHistoryKey.current) {
      history.goBack();
    }
  };

  const ensureHistoryBuffer = () => {
    const { state } = history.location;
    if (!state || (state as any).plFeModalKey !== modalHistoryKey.current) {
      history.push({ ...history.location, state: { ...(state as any), plFeModalKey: modalHistoryKey.current } });
    }
  };

  const getSiblings = () => Array(...(ref.current!.parentElement!.childNodes as any as ChildNode[]))
    .filter(node => (node as HTMLDivElement).id !== '_rht_toaster')
    .filter(node => node !== ref.current);

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
      getSiblings().forEach(sibling => (sibling as HTMLDivElement).setAttribute('inert', 'true'));

      handleModalOpen();
    } else if (!prevChildren) {
      setRevealed(false);
    }

    if (!children && !!prevChildren) {
      activeElement.current?.focus();
      activeElement.current = null;
      getSiblings().forEach(sibling => (sibling as HTMLDivElement).removeAttribute('inert'));

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
            role='dialog'
            className='⁂-modal-root__modal'
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
};

export {
  checkComposeContent,
  ModalRoot as default,
};
