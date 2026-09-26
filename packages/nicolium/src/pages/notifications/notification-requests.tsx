import iconSlidersHorizontal from '@phosphor-icons/core/regular/sliders-horizontal.svg';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import {
  NotificationRequestsColumn,
  NotificationRequestsSettings,
} from '@/columns/notification-requests';
import Column from '@/components/ui/column';
import IconButton from '@/components/ui/icon-button';

import '@/styles/notifications.scss';

const messages = defineMessages({
  title: { id: 'columns.notification_requests', defaultMessage: 'Filtered notifications' },
  settings: { id: 'notifications.settings', defaultMessage: 'Notification settings' },
});

const NotificationRequestsPage = () => {
  const intl = useIntl();
  const [showSettings, setShowSettings] = useState(false);

  const handleShowSettings = () => {
    setShowSettings((value) => !value);
  };

  return (
    <Column
      label={intl.formatMessage(messages.title)}
      action={
        <IconButton
          title={intl.formatMessage(messages.settings)}
          src={iconSlidersHorizontal}
          onClick={handleShowSettings}
        />
      }
    >
      {showSettings && <NotificationRequestsSettings />}
      <NotificationRequestsColumn />
    </Column>
  );
};

export { NotificationRequestsPage as default };
