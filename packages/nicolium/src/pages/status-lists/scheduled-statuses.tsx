import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import PullToRefresh from '@/components/pull-to-refresh';
import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
import ScheduledStatus from '@/features/scheduled-statuses/components/scheduled-status';
import { useScheduledStatusesQuery } from '@/queries/statuses/scheduled-statuses';

const messages = defineMessages({
  heading: { id: 'column.scheduled_statuses', defaultMessage: 'Scheduled posts' },
});

const ScheduledStatusesPage = () => {
  const intl = useIntl();

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
      defaultMessage="You don't have any scheduled posts yet. When you add one, it will show up here."
    />
  );

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <PullToRefresh onRefresh={refetch}>
        <ScrollableList
          hasMore={hasNextPage}
          isLoading={isLoading}
          onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
          emptyMessageText={emptyMessage}
          listClassName='⁂-status-list'
        >
          {scheduledStatuses.map((status) => (
            <ScheduledStatus key={status.id} scheduledStatus={status} />
          ))}
        </ScrollableList>
      </PullToRefresh>
    </Column>
  );
};

export { ScheduledStatusesPage as default };
