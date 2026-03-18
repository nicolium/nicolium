import iconCheckCircle from '@phosphor-icons/core/regular/check-circle.svg';
import iconInfo from '@phosphor-icons/core/regular/info.svg';
import iconWarningCircle from '@phosphor-icons/core/regular/warning-circle.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import { Link, type LinkOptions } from '@tanstack/react-router';
import clsx from 'clsx';
import React from 'react';
import toast, { type Toast as RHToast } from 'react-hot-toast';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import Icon from './icon';

import type { ToastText, ToastType } from '@/toast';

const messages = defineMessages({
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
});

const renderText = (text: ToastText) => {
  if (typeof text === 'string') {
    return text;
  } else {
    return <FormattedMessage {...text} />;
  }
};

interface IToast {
  t: RHToast;
  message: ToastText;
  type: ToastType;
  action?(): void;
  actionLinkOptions?: LinkOptions;
  actionLabel?: ToastText;
  summary?: string;
}

/**
 * Customizable Toasts for in-app notifications.
 */
const Toast: React.FC<IToast> = (props) => {
  const { t, message, type, action, actionLinkOptions, actionLabel, summary } = props;

  const intl = useIntl();

  const dismissToast = () => {
    toast.dismiss(t.id);
  };

  const liveRegionRole = type === 'error' ? 'alert' : 'status';
  const liveRegionPriority = type === 'error' ? 'assertive' : 'polite';
  const messageId = `toast-message-${String(t.id)}`;
  const summaryId = summary ? `toast-summary-${String(t.id)}` : undefined;

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <Icon src={iconCheckCircle} aria-hidden />;
      case 'info':
        return <Icon src={iconInfo} aria-hidden />;
      case 'error':
        return <Icon src={iconWarningCircle} aria-hidden />;
    }
  };

  const renderAction = () => {
    if (action && actionLabel) {
      return (
        <button
          type='button'
          onClick={() => {
            dismissToast();
            action();
          }}
          data-testid='toast-action'
        >
          {renderText(actionLabel)}
        </button>
      );
    }

    if (actionLinkOptions && actionLabel) {
      return (
        <Link {...actionLinkOptions} onClick={dismissToast} data-testid='toast-action-link'>
          {renderText(actionLabel)}
        </Link>
      );
    }

    return null;
  };

  return (
    <div
      data-testid='toast'
      role={liveRegionRole}
      aria-live={liveRegionPriority}
      aria-atomic='true'
      aria-describedby={summaryId ? `${messageId} ${summaryId}` : messageId}
      className={clsx({
        [`⁂-toast ⁂-toast--${type}`]: true,
        '⁂-toast--visible': t.visible,
      })}
    >
      <div>
        <div className='⁂-toast__body'>
          <div className='⁂-toast__content'>
            <div className={`⁂-toast__icon`}>{renderIcon()}</div>

            <p id={messageId} data-testid='toast-message'>
              {renderText(message)}
            </p>
          </div>

          {/* Action */}
          {renderAction()}
        </div>

        {/* Dismiss Button */}
        <div className='⁂-toast__dismiss'>
          <button
            type='button'
            onClick={dismissToast}
            data-testid='toast-dismiss'
            title={intl.formatMessage(messages.close)}
            aria-label={intl.formatMessage(messages.close)}
          >
            <Icon src={iconX} />
          </button>
        </div>
      </div>

      {summary ? <p id={summaryId}>{summary}</p> : null}
    </div>
  );
};

export { Toast as default };
