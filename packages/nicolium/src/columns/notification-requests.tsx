import { useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import React, { useRef } from 'react';

import AccountContainer from '@/components/accounts/account-container';
import PullToRefresh from '@/components/pull-to-refresh';
import ScrollableList from '@/components/scrollable-list';
import Counter from '@/components/ui/counter';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryKeys } from '@/queries/keys';
import { useNotificationRequests } from '@/queries/notifications/use-notification-requests';
import { userTouching } from '@/utils/is-mobile';

import type { MinifiedNotificationRequest } from '@/queries/utils/minify-list';

interface INotificationRequest {
  request: MinifiedNotificationRequest;
}

const NotificationRequest: React.FC<INotificationRequest> = ({ request }) => {
  return (
    <AccountContainer
      id={request.account_id}
      emoji={<Counter className='account-card__emoji' count={+request.notifications_count} />}
      hideActions
    />
  );
};

interface INotificationRequestsColumn {
  /** Whether the container is used as scroll parent instead of the window. */
  multiColumn?: boolean;
}

const NotificationRequestsColumn: React.FC<INotificationRequestsColumn> = ({ multiColumn }) => {
  const columnId: string = useRef(`notificationRequests-${crypto.randomUUID()}`).current;

  const {
    data: requests = [],
    isLoading,
    isFetching,
    // isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    // refetch,
  } = useNotificationRequests();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  const handleRefresh = () => {
    queryClient.resetQueries({
      queryKey: [scopeUrl, ...queryKeys.notifications.notificationRequests.root],
    });
  };

  const scrollContainer = (
    <ScrollableList
      // ref={node}
      id={columnId}
      scrollKey='notification_requests'
      isLoading={isFetching}
      showLoading={isLoading}
      hasMore={hasNextPage ?? false}
      // emptyMessageText={emptyMessage}
      // placeholderComponent={PlaceholderNotification}
      placeholderCount={20}
      onLoadMore={() => fetchNextPage()}
      // onScrollToTop={handleScrollToTop}
      listClassName={clsx('status-list', { 'status-list--loading': isLoading })}
      itemClassName='account-list__item'
      useWindowScroll={!multiColumn}
    >
      {requests.map((request) => (
        <NotificationRequest key={request.id} request={request} />
      ))}
    </ScrollableList>
  );

  if (userTouching.matches)
    return <PullToRefresh onRefresh={handleRefresh}>{scrollContainer}</PullToRefresh>;
  return scrollContainer;
};

export { NotificationRequestsColumn };
