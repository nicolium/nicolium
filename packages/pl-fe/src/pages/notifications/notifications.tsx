import React, { useCallback, useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { createSelector } from 'reselect';

import { markReadNotifications } from 'pl-fe/actions/notifications';
import NotificationsColumn from 'pl-fe/columns/notifications';
import ScrollTopButton from 'pl-fe/components/scroll-top-button';
import Column from 'pl-fe/components/ui/column';
import Portal from 'pl-fe/components/ui/portal';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useSettings } from 'pl-fe/hooks/use-settings';

import type { RootState } from 'pl-fe/store';

const messages = defineMessages({
  title: { id: 'column.notifications', defaultMessage: 'Notifications' },
  queue: { id: 'notifications.queue_label', defaultMessage: 'Click to see {count} new {count, plural, one {notification} other {notifications}}' },
});

const getNotifications = createSelector([
  (state: RootState) => state.notifications.items,
  (_, topNotification?: string) => topNotification,
], (notifications, topNotificationId) => {
  if (topNotificationId) {
    const queuedNotificationCount = notifications.findIndex((notification) =>
      notification.most_recent_notification_id <= topNotificationId,
    );
    const displayedNotifications = notifications.slice(queuedNotificationCount);

    return {
      queuedNotificationCount,
      displayedNotifications,
    };
  }

  return {
    queuedNotificationCount: 0,
    displayedNotifications: notifications,
  };
});

const NotificationsPage = () => {
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const intl = useIntl();
  const settings = useSettings();

  const showFilterBar = (features.notificationsExcludeTypes || features.notificationsIncludeTypes) && settings.notifications.quickFilter.show;
  const [topNotification, setTopNotification] = useState<string>();
  const { queuedNotificationCount, displayedNotifications } = useAppSelector(state => getNotifications(state, topNotification));

  const handleDequeueNotifications = useCallback(() => {
    setTopNotification(undefined);
    dispatch(markReadNotifications());
  }, []);

  useEffect(() => {
    if (topNotification || displayedNotifications.length === 0) return;
    setTopNotification(displayedNotifications[0].most_recent_notification_id);
  }, [displayedNotifications.length]);

  return (
    <Column label={intl.formatMessage(messages.title)} withHeader={!showFilterBar}>
      <Portal>
        <ScrollTopButton
          onClick={handleDequeueNotifications}
          count={queuedNotificationCount}
          message={messages.queue}
        />
      </Portal>

      <NotificationsColumn />
    </Column>
  );
};

export { NotificationsPage as default };
