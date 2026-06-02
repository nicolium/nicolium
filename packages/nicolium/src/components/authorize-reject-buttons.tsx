import iconStopFill from '@phosphor-icons/core/fill/stop-fill.svg';
import iconCheck from '@phosphor-icons/core/regular/check.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import IconButton from '@/components/ui/icon-button';

const messages = defineMessages({
  authorize: { id: 'authorize.action', defaultMessage: 'Approve' },
  reject: { id: 'reject.action', defaultMessage: 'Reject' },
});

interface IAuthorizeRejectButtons {
  onAuthorize(): Promise<unknown> | unknown;
  onReject(): Promise<unknown> | unknown;
  countdown?: number;
}

/** Buttons to approve or reject a pending item, usually an account. */
const AuthorizeRejectButtons: React.FC<IAuthorizeRejectButtons> = ({
  onAuthorize,
  onReject,
  countdown,
}) => {
  const intl = useIntl();
  const [state, setState] = useState<
    'authorizing' | 'rejecting' | 'authorized' | 'rejected' | 'pending'
  >('pending');
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  const [progress, setProgress] = useState<number>(0);

  const startProgressInterval = () => {
    let startValue = 1;
    interval.current = setInterval(
      () => {
        startValue++;
        const newValue = startValue * 3.6; // get to 360 (deg)
        setProgress(newValue);

        if (newValue >= 360) {
          clearInterval(interval.current as NodeJS.Timeout);
          setProgress(0);
        }
      },
      (countdown as number) / 100,
    );
  };

  const handleAction = (
    present: 'authorizing' | 'rejecting',
    past: 'authorized' | 'rejected',
    action: () => Promise<unknown> | unknown,
  ): void => {
    if (state === present) {
      if (interval.current) {
        clearInterval(interval.current);
      }
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      setState('pending');
    } else {
      const doAction = async () => {
        try {
          await action();
          setState(past);
        } catch (e) {
          if (e) console.error(e);
        }
      };
      if (typeof countdown === 'number') {
        setState(present);
        timeout.current = setTimeout(doAction, countdown);
        startProgressInterval();
      } else {
        doAction();
      }
    }
  };

  const handleAuthorize = () => {
    handleAction('authorizing', 'authorized', onAuthorize);
  };
  const handleReject = () => {
    handleAction('rejecting', 'rejected', onReject);
  };

  const renderStyle = (selectedState: typeof state) => {
    if (state === 'authorizing' && selectedState === 'authorizing') {
      return {
        background: `conic-gradient(rgb(var(--color-primary-500)) ${progress}deg, rgb(var(--color-primary-500) / 0.1) 0deg)`,
      };
    } else if (state === 'rejecting' && selectedState === 'rejecting') {
      return {
        background: `conic-gradient(rgb(var(--color-danger-600)) ${progress}deg, rgb(var(--color-danger-600) / 0.1) 0deg)`,
      };
    }

    return {};
  };

  useEffect(
    () => () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      if (interval.current) {
        clearInterval(interval.current);
      }
    },
    [],
  );

  switch (state) {
    case 'authorized':
      return (
        <ActionEmblem
          text={<FormattedMessage id='authorize.success' defaultMessage='Approved' />}
        />
      );
    case 'rejected':
      return (
        <ActionEmblem text={<FormattedMessage id='reject.success' defaultMessage='Rejected' />} />
      );
    default:
      return (
        <div className='authorize-reject-buttons'>
          <AuthorizeRejectButton
            theme='danger'
            icon={iconX}
            action={handleReject}
            isLoading={state === 'rejecting'}
            disabled={state === 'authorizing'}
            style={renderStyle('rejecting')}
            title={intl.formatMessage(messages.reject)}
          />
          <AuthorizeRejectButton
            theme='primary'
            icon={iconCheck}
            action={handleAuthorize}
            isLoading={state === 'authorizing'}
            disabled={state === 'rejecting'}
            style={renderStyle('authorizing')}
            title={intl.formatMessage(messages.authorize)}
          />
        </div>
      );
  }
};

interface IActionEmblem {
  text: React.ReactNode;
}

const ActionEmblem: React.FC<IActionEmblem> = ({ text }) => (
  <p className='authorize-reject-buttons__emblem'>{text}</p>
);

interface IAuthorizeRejectButton {
  theme: 'primary' | 'danger';
  icon: string;
  action(): void;
  isLoading?: boolean;
  disabled?: boolean;
  style: React.CSSProperties;
  title?: string;
}

const AuthorizeRejectButton: React.FC<IAuthorizeRejectButton> = ({
  theme,
  icon,
  action,
  isLoading,
  style,
  disabled,
  title,
}) => (
  <div
    style={style}
    className={clsx({
      'authorize-button': theme === 'primary',
      'reject-button': theme === 'danger',
    })}
  >
    <IconButton
      src={isLoading ? iconStopFill : icon}
      onClick={action}
      theme='seamless'
      disabled={disabled}
      title={title}
    />
  </div>
);

export { AuthorizeRejectButtons };
