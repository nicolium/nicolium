import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import ScheduledStatusesColumn from '@/columns/scheduled-statuses';
import Column from '@/components/ui/column';

const messages = defineMessages({
  heading: { id: 'column.scheduled_statuses', defaultMessage: 'Scheduled posts' },
});

const ScheduledStatusesPage = () => {
  const intl = useIntl();

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScheduledStatusesColumn />
    </Column>
  );
};

export { ScheduledStatusesPage as default };
