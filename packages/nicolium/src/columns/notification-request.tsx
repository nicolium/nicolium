import clsx from 'clsx';
import React, { useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import Notification from '@/components/notifications/notification';
import PlaceholderNotification from '@/components/placeholders/placeholder-notification';
import ScrollableList from '@/components/scrollable-list';
import {
  useNotificationRequest,
  useNotificationsFromAccount,
} from '@/queries/notifications/use-notification-requests';
import { selectChild } from '@/utils/scroll-utils';

import type { VirtuosoHandle } from 'react-virtuoso';

interface INotificationRequestColumn {
  requestId: string;
}

const NotificationRequestColumn: React.FC<INotificationRequestColumn> = ({ requestId }) => {
  const columnId: string = useRef(`notificationRequest-${requestId}`).current;
  const node = useRef<VirtuosoHandle | null>(null);

  const { data: request } = useNotificationRequest(requestId);
  const {
    data: notifications = [],
    isFetching,
    isLoading,
    hasNextPage,
    fetchNextPage,
  } = useNotificationsFromAccount(request?.account_id);

  const emptyMessage = (
    <FormattedMessage
      id='empty_column.notification_request'
      defaultMessage='There are no pending notifications from this user yet.'
    />
  );

  const handleMoveUp = (id: string) => {
    const elementIndex =
      notifications.findIndex((item) => item !== null && item.group_key === id) - 1;
    selectChild(elementIndex, node, document.getElementById(columnId) ?? undefined);
  };

  const handleMoveDown = (id: string) => {
    const elementIndex =
      notifications.findIndex((item) => item !== null && item.group_key === id) + 1;
    selectChild(
      elementIndex,
      node,
      document.getElementById(columnId) ?? undefined,
      notifications.length,
    );
  };

  return (
    <ScrollableList
      ref={node}
      id={columnId}
      scrollKey={`notificationRequest_${requestId}`}
      isLoading={isFetching}
      showLoading={isLoading}
      hasMore={hasNextPage ?? false}
      emptyMessageText={emptyMessage}
      placeholderComponent={PlaceholderNotification}
      placeholderCount={20}
      onLoadMore={() => fetchNextPage()}
      listClassName={clsx('status-list', { 'status-list--loading': isLoading })}
    >
      {notifications.map((notification) => (
        <Notification
          key={notification.group_key}
          notification={notification}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
        />
      ))}
    </ScrollableList>
  );
};

export { NotificationRequestColumn };
