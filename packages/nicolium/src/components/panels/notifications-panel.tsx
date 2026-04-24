import iconCaretRight from '@phosphor-icons/core/regular/caret-right.svg';
import { Link } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import NotificationsColumn from '@/columns/notifications';
import Icon from '@/components//ui/icon';
import Widget from '@/components/ui/widget';

const messages = defineMessages({
  viewAll: { id: 'notifications.view_all', defaultMessage: 'View all' },
});

const NotificationsPanel: React.FC = () => {
  const intl = useIntl();

  return (
    <Widget
      className='⁂-notifications-panel'
      title={<FormattedMessage id='column.notifications' defaultMessage='Notifications' />}
      action={
        <Link to='/notifications' title={intl.formatMessage(messages.viewAll)}>
          <Icon src={iconCaretRight} aria-hidden />
        </Link>
      }
    >
      <NotificationsColumn multiColumn compact />
    </Widget>
  );
};

export { NotificationsPanel as default };
