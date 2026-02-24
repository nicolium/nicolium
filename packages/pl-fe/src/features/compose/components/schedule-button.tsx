import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { addSchedule, removeSchedule } from '@/actions/compose';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useCompose } from '@/hooks/use-compose';

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
  const dispatch = useAppDispatch();

  const compose = useCompose(composeId);

  const active = !!compose.scheduledAt;
  const unavailable = !!compose.editedId;

  const handleClick = () => {
    if (active) {
      dispatch(removeSchedule(composeId));
    } else {
      dispatch(addSchedule(composeId));
    }
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
