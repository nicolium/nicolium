import iconArrowSquareOut from '@phosphor-icons/core/regular/arrow-square-out.svg';
import iconCheck from '@phosphor-icons/core/regular/check.svg';
import iconProhibit from '@phosphor-icons/core/regular/prohibit.svg';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Button from '@/components/ui/button';
import { useCurrentAccount } from '@/contexts/current-account-context';
import {
  useJoinEventMutation,
  useLeaveEventMutation,
} from '@/queries/statuses/use-event-interactions';
import { useModalsActions } from '@/stores/modals';

import type { ButtonThemes } from '@/components/ui/button/useButtonStyles';
import type { NormalizedStatus as StatusEntity } from '@/queries/statuses/normalize';

const messages = defineMessages({
  leaveHeading: { id: 'confirmations.leave_event.heading', defaultMessage: 'Leave event' },
  leaveMessage: {
    id: 'confirmations.leave_event.message',
    defaultMessage:
      'If you want to rejoin the event, the request will be manually reviewed again. Are you sure you want to proceed?',
  },
  leaveConfirm: { id: 'confirmations.leave_event.confirm', defaultMessage: 'Leave event' },
});

interface IEventAction {
  status: Pick<StatusEntity, 'id' | 'event' | 'url'>;
  theme?: ButtonThemes;
}

const EventActionButton: React.FC<IEventAction> = ({ status, theme = 'secondary' }) => {
  const intl = useIntl();

  const { openModal } = useModalsActions();
  const me = useCurrentAccount();

  const { mutate: joinEvent } = useJoinEventMutation(status.id);
  const { mutate: leaveEvent } = useLeaveEventMutation(status.id);

  const event = status.event!;

  if (event.join_mode === 'external') {
    return (
      <Button
        className='event-action-button'
        size='sm'
        theme={theme}
        icon={iconArrowSquareOut}
        href={status.url}
      >
        <FormattedMessage id='event.join_state.empty' defaultMessage='Participate' />
      </Button>
    );
  }

  const handleJoin: React.EventHandler<React.MouseEvent> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (event.join_mode === 'free') {
      joinEvent(undefined);
    } else {
      openModal('JOIN_EVENT', {
        statusId: status.id,
      });
    }
  };

  const handleLeave: React.EventHandler<React.MouseEvent> = (e) => {
    e.preventDefault();

    if (event.join_mode === 'restricted') {
      openModal('CONFIRM', {
        heading: intl.formatMessage(messages.leaveHeading),
        message: intl.formatMessage(messages.leaveMessage),
        confirm: intl.formatMessage(messages.leaveConfirm),
        onConfirm: () => {
          leaveEvent();
        },
      });
    } else {
      leaveEvent();
    }
  };

  const handleOpenUnauthorizedModal: React.EventHandler<React.MouseEvent> = (e) => {
    e.preventDefault();

    openModal('UNAUTHORIZED', {
      action: 'JOIN',
      ap_id: status.url,
    });
  };

  let buttonLabel;
  let buttonIcon;
  let buttonDisabled = false;
  let buttonAction = handleLeave;

  switch (event.join_state) {
    case 'accept':
      buttonLabel = <FormattedMessage id='event.join_state.accept' defaultMessage='Going' />;
      buttonIcon = iconCheck;
      break;
    case 'pending':
      buttonLabel = <FormattedMessage id='event.join_state.pending' defaultMessage='Pending' />;
      break;
    case 'reject':
      buttonLabel = <FormattedMessage id='event.join_state.rejected' defaultMessage='Going' />;
      buttonIcon = iconProhibit;
      buttonDisabled = true;
      break;
    default:
      buttonLabel = <FormattedMessage id='event.join_state.empty' defaultMessage='Participate' />;
      buttonAction = me ? handleJoin : handleOpenUnauthorizedModal;
  }

  return (
    <Button
      className='event-action-button'
      size='sm'
      theme={theme}
      icon={buttonIcon}
      onClick={buttonAction}
      disabled={buttonDisabled}
    >
      {buttonLabel}
    </Button>
  );
};

export { EventActionButton as default };
