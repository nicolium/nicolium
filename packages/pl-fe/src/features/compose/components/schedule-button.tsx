import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useCompose, useComposeActions } from '@/stores/compose';

import ComposeFormButton from './compose-form-button';

const messages = defineMessages({
  addSchedule: { id: 'schedule_button.add_schedule', defaultMessage: 'Schedule post for later' },
  removeSchedule: { id: 'schedule_button.remove_schedule', defaultMessage: 'Post immediately' },
});

interface IScheduleButton {
  composeId: string;
  disabled?: boolean;
}

const ScheduleButton: React.FC<IScheduleButton> = ({ composeId, disabled }) => {
  const intl = useIntl();
  const { updateCompose } = useComposeActions();

  const compose = useCompose(composeId);

  const active = !!compose.scheduledAt;
  const unavailable = !!compose.editedId;

  const handleClick = () => {
    updateCompose(composeId, (draft) => {
      draft.scheduledAt = active ? null : new Date(Date.now() + 10 * 60 * 1000);
    });
  };

  if (unavailable) {
    return null;
  }

  return (
    <ComposeFormButton
      icon={require('@phosphor-icons/core/regular/calendar-plus.svg')}
      title={intl.formatMessage(active ? messages.removeSchedule : messages.addSchedule)}
      active={active}
      disabled={disabled}
      onClick={handleClick}
    />
  );
};

export { ScheduleButton as default };
