import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import NotificationsColumn from '@/columns/notifications';
import Widget from '@/components/ui/widget';

const messages = defineMessages({
  viewAll: { id: 'notifications.view_all', defaultMessage: 'View all' },
});

const NotificationsPanel: React.FC = () => {
  const intl = useIntl();

  return (
    <Widget
      className='notifications-panel'
      title={<FormattedMessage id='column.notifications' defaultMessage='Notifications' />}
      to='/notifications'
      actionTitle={intl.formatMessage(messages.viewAll)}
    >
      <NotificationsColumn multiColumn compact />
    </Widget>
  );
};

export { NotificationsPanel as default };
