import clsx from 'clsx';
import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { useOwnAccount } from '@/hooks/use-own-account';

import IconButton from './icon-button';

import type { ButtonThemes } from './button/useButtonStyles';

const messages = defineMessages({
  back: { id: 'card.back.label', defaultMessage: 'Back' },
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
  confirm: { id: 'confirmations.delete.confirm', defaultMessage: 'Delete' },
});

const useDefaultCloseIcon = (): string => {
  const { data: account } = useOwnAccount();

  if (
    account?.url === 'https://donotsta.re/users/pmysl' ||
    account?.url === 'https://to.juz.sie.federu.je/@pmysl'
  ) {
    return require('@phosphor-icons/core/regular/twitter-logo.svg');
  }

  return require('@phosphor-icons/core/regular/x.svg');
};

interface IModal {
  /** Callback when the modal is cancelled. */
  cancelAction?: () => void;
  /** Cancel button text. */
  cancelText?: React.ReactNode;
  /** URL to an SVG icon for the close button. */
  closeIcon?: string;
  /** Position of the close button. */
  closePosition?: 'left' | 'right';
  /** Callback when the modal is confirmed. */
  confirmationAction?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
  /** Whether the confirmation button is disabled. */
  confirmationDisabled?: boolean;
  /** Confirmation button text. */
  confirmationText?: React.ReactNode;
  /** Confirmation button theme. */
  confirmationTheme?: ButtonThemes;
  /** Callback when the modal is closed. */
  onClose?: () => void;
  /** Callback when the secondary action is chosen. */
  secondaryAction?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
  /** Secondary button text. */
  secondaryText?: React.ReactNode;
  secondaryDisabled?: boolean;
  /** Don't focus the "confirm" button on mount. */
  skipFocus?: boolean;
  /** Title text for the modal. */
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  onBack?: () => void;
}

/** Displays a modal dialog box. */
const Modal = React.forwardRef<HTMLDivElement, IModal>(
  (
    {
      cancelAction,
      cancelText,
      children,
      closeIcon,
      closePosition = 'right',
      confirmationAction,
      confirmationDisabled,
      confirmationText,
      confirmationTheme,
      onClose,
      secondaryAction,
      secondaryDisabled = false,
      secondaryText,
      skipFocus = false,
      title,
      className,
      onBack,
    },
    ref,
  ) => {
    const intl = useIntl();
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [firstRender, setFirstRender] = React.useState(true);

    const defaultCloseIcon = useDefaultCloseIcon();

    closeIcon = closeIcon ?? defaultCloseIcon;

    React.useEffect(() => {
      setFirstRender(false);
    }, []);

    React.useEffect(() => {
      if (buttonRef?.current && !skipFocus) {
        buttonRef.current.focus();
      }
    }, [skipFocus, buttonRef]);

    return (
      <div
        ref={ref}
        data-testid='modal'
        className={clsx(
          '⁂-modal',
          {
            '⁂-modal--first-render': firstRender,
            '⁂-modal--close-position-left': closePosition === 'left',
          },
          className,
        )}
      >
        {title && (
          <div className='⁂-modal__title'>
            <div>
              {onBack && (
                <IconButton
                  src={require('@phosphor-icons/core/regular/arrow-left.svg')}
                  title={intl.formatMessage(messages.back)}
                  onClick={onBack}
                />
              )}

              <h2 id='modal-title'>{title}</h2>

              {onClose && (
                <IconButton
                  src={closeIcon}
                  title={intl.formatMessage(messages.close)}
                  onClick={onClose}
                />
              )}
            </div>
          </div>
        )}

        <div className='⁂-modal__body'>
          <div className='⁂-modal__children'>{children}</div>

          {confirmationAction && (
            <div className='⁂-modal__actions' data-testid='modal-actions'>
              <div className='⁂-modal__actions__cancel'>
                {cancelAction && (
                  <button className='⁂-modal__action-cancel' onClick={cancelAction}>
                    {cancelText ?? <FormattedMessage id='common.cancel' defaultMessage='Cancel' />}
                  </button>
                )}
              </div>

              <div className='⁂-modal__actions__other'>
                {secondaryAction && (
                  <button
                    className='⁂-modal__action-secondary'
                    onClick={secondaryAction}
                    disabled={secondaryDisabled}
                  >
                    {secondaryText}
                  </button>
                )}

                <button
                  className={clsx('⁂-modal__action', {
                    '⁂-modal__action--danger': confirmationTheme === 'danger',
                  })}
                  onClick={confirmationAction}
                  disabled={confirmationDisabled}
                  ref={buttonRef}
                >
                  {confirmationText}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

Modal.displayName = 'Modal';

export { Modal as default };
