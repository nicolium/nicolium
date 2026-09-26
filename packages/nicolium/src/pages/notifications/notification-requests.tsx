import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { NotificationRequestsColumn } from '@/columns/notification-requests';
import Column from '@/components/ui/column';

const messages = defineMessages({
  title: { id: 'columns.filtered_notifications', defaultMessage: 'Filtered notifications' },
});

const NotificationRequestsPage = () => {
  const intl = useIntl();

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <NotificationRequestsColumn />
    </Column>
  );
};

export { NotificationRequestsPage as default };
