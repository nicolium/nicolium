import React from 'react';
import { FormattedMessage } from 'react-intl';

import NotificationsColumn from '@/columns/notifications';
import Widget from '@/components/ui/widget';

const NotificationsPanel: React.FC = () => {
  return (
    <Widget
      className='⁂-notifications-panel'
      title={<FormattedMessage id='column.notifications' defaultMessage='Notifications' />}
    >
      <NotificationsColumn multiColumn compact />
    </Widget>
  );
};

export { NotificationsPanel as default };
