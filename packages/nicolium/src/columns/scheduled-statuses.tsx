import React from 'react';
import { FormattedMessage } from 'react-intl';

import PullToRefresh from '@/components/pull-to-refresh';
import ScrollableList from '@/components/scrollable-list';
import ScheduledStatus from '@/features/scheduled-statuses/components/scheduled-status';
import { useScheduledStatusesQuery } from '@/queries/statuses/scheduled-statuses';

const ScheduledStatusesColumn = () => {
  const {
    data: scheduledStatuses = [],
    isLoading,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useScheduledStatusesQuery();

  const emptyMessage = (
    <FormattedMessage
      id='empty_column.scheduled_statuses'
      defaultMessage='You don’t have any scheduled posts yet. When you add one, it will show up here.'
    />
  );

  return (
    <PullToRefresh onRefresh={refetch}>
      <ScrollableList
        hasMore={hasNextPage}
        isLoading={isLoading}
        onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
        emptyMessageText={emptyMessage}
        listClassName='status-list'
      >
        {scheduledStatuses.map((status) => (
          <ScheduledStatus key={status.id} scheduledStatus={status} />
        ))}
      </ScrollableList>
    </PullToRefresh>
  );
};

export { ScheduledStatusesColumn as default };
