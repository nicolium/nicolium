import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useCompose, useComposeActions } from '@/stores/compose';

import { DateTimePicker } from '../ui/date-time-picker';

import type { ICompose } from './compose';

const messages = defineMessages({
  datePickerHint: { id: 'datepicker.hint', defaultMessage: 'Scheduled to post at…' },
});

const ComposeScheduleForm: React.FC<ICompose> = ({ composeId }) => {
  const intl = useIntl();
  const compose = useCompose(composeId);
  const { updateCompose } = useComposeActions();

  if (!compose.scheduledAt) {
    return null;
  }

  return (
    <DateTimePicker
      title={intl.formatMessage(messages.datePickerHint)}
      initialDate={compose.scheduledAt}
      onSelect={(date) => {
        updateCompose(composeId, (draft) => {
          draft.scheduledAt = date;
        });
      }}
      rangeStart={new Date(Date.now() + 10 * 60 * 1000)}
    />
  );
};

export { ComposeScheduleForm };
