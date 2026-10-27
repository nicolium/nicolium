import { IconButton } from '@mkljczk/react-native-paper';
import { CalendarPlusIcon } from 'phosphor-react-native/src/icons/CalendarPlus';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useCompose, useComposeActions } from '@/stores/compose';

import { iconHelper } from '../ui/icon';

import type { ICompose } from './compose';

const messages = defineMessages({
  addSchedule: { id: 'schedule_button.add_schedule', defaultMessage: 'Schedule post for later' },
  removeSchedule: { id: 'schedule_button.remove_schedule', defaultMessage: 'Post immediately' },
});

const ComposeScheduleButton: React.FC<ICompose> = ({ composeId }) => {
  const intl = useIntl();
  const compose = useCompose(composeId);
  const { updateCompose } = useComposeActions();

  const active = !!compose.scheduledAt;
  const unavailable = !!compose.editedId;

  const handlePress = () => {
    updateCompose(composeId, (draft) => {
      draft.scheduledAt = active ? null : new Date(Date.now() + 10 * 60 * 1000);
    });
  };

  if (unavailable) {
    return null;
  }

  return (
    <IconButton
      icon={iconHelper(CalendarPlusIcon)}
      style={{ marginHorizontal: 0 }}
      mode={active ? 'contained' : undefined}
      selected={active}
      onPress={handlePress}
      accessibilityLabel={intl.formatMessage(
        compose.scheduledAt ? messages.removeSchedule : messages.addSchedule,
      )}
    />
  );
};

export { ComposeScheduleButton };
