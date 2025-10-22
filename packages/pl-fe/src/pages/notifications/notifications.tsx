import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import NotificationsColumn from 'pl-fe/columns/notifications';
import Column from 'pl-fe/components/ui/column';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useSettings } from 'pl-fe/stores/settings';

const messages = defineMessages({
  title: { id: 'column.notifications', defaultMessage: 'Notifications' },
});

const NotificationsPage = () => {
  const features = useFeatures();
  const intl = useIntl();
  const settings = useSettings();

  const showFilterBar = (features.notificationsExcludeTypes || features.notificationsIncludeTypes) && settings.notifications.quickFilter.show;

  return (
    <Column label={intl.formatMessage(messages.title)} withHeader={!showFilterBar}>
      <NotificationsColumn />
    </Column>
  );
};

export { NotificationsPage as default };
