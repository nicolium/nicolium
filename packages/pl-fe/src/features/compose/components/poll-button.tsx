import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { addPoll, removePoll } from '@/actions/compose';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useCompose } from '@/hooks/use-compose';

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
  const dispatch = useAppDispatch();

  const compose = useCompose(composeId);

  const unavailable = compose.isUploading;
  const active = compose.poll !== null;

  const onClick = () => {
    if (active) {
      dispatch(removePoll(composeId));
    } else {
      dispatch(addPoll(composeId));
    }
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
