import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import FormGroup from '@/components/ui/form-group';
import Modal from '@/components/ui/modal';
import Textarea from '@/components/ui/textarea';
import { useJoinEventMutation } from '@/queries/statuses/use-event-interactions';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

const messages = defineMessages({
  hint: {
    id: 'join_event.hint',
    defaultMessage: 'You can tell the organizer why do you want to participate in this event:',
  },
  placeholder: { id: 'join_event.placeholder', defaultMessage: 'Message to organizer' },
  join: { id: 'join_event.join', defaultMessage: 'Request join' },
});

interface JoinEventModalProps {
  statusId: string;
}

const JoinEventModal: React.FC<BaseModalProps & JoinEventModalProps> = ({ onClose, statusId }) => {
  const intl = useIntl();

  const { mutate: joinEvent } = useJoinEventMutation(statusId);

  const [participationMessage, setParticipationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    onClose('JOIN_EVENT');
  };

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setParticipationMessage(e.target.value);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    joinEvent(participationMessage, {
      onSuccess: () => {
        handleClose();
      },
      onError: () => {
        setIsSubmitting(false);
      },
    });
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  return (
    <Modal
      title={<FormattedMessage id='join_event.title' defaultMessage='Join event' />}
      onClose={handleClose}
      confirmationAction={handleSubmit}
      confirmationText={intl.formatMessage(messages.join)}
      confirmationDisabled={isSubmitting}
    >
      <FormGroup labelText={intl.formatMessage(messages.hint)}>
        <Textarea
          placeholder={intl.formatMessage(messages.placeholder)}
          value={participationMessage}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
          autoFocus
        />
      </FormGroup>
    </Modal>
  );
};

export { JoinEventModal as default, type JoinEventModalProps };
