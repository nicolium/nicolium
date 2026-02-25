import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useCompose, useComposeActions, newPoll } from '@/stores/compose';

import ComposeFormButton from './compose-form-button';

const messages = defineMessages({
  addPoll: { id: 'poll_button.add_poll', defaultMessage: 'Add a poll' },
  removePoll: { id: 'poll_button.remove_poll', defaultMessage: 'Remove poll' },
});

interface IPollButton {
  composeId: string;
  disabled?: boolean;
}

const PollButton: React.FC<IPollButton> = ({ composeId, disabled }) => {
  const intl = useIntl();
  const { updateCompose } = useComposeActions();

  const compose = useCompose(composeId);

  const unavailable = compose.isUploading;
  const active = compose.poll !== null;

  const onClick = () => {
    updateCompose(composeId, (draft) => {
      draft.poll = active ? null : newPoll();
    });
  };

  if (unavailable) {
    return null;
  }

  return (
    <ComposeFormButton
      icon={require('@phosphor-icons/core/regular/chart-bar.svg')}
      title={intl.formatMessage(active ? messages.removePoll : messages.addPoll)}
      active={active}
      disabled={disabled}
      onClick={onClick}
    />
  );
};

export { PollButton as default };
