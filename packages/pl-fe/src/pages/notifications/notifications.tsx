import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import NotificationsColumn from '@/columns/notifications';
import Column from '@/components/ui/column';

const messages = defineMessages({
  title: { id: 'column.notifications', defaultMessage: 'Notifications' },
});

const NotificationsPage = () => {
  const intl = useIntl();

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <NotificationsColumn />
    </Column>
  );
};

export { NotificationsPage as default };
