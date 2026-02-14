import { useInfiniteQuery } from '@tanstack/react-query';
import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
import ScheduledStatus from '@/features/scheduled-statuses/components/scheduled-status';
import { scheduledStatusesQueryOptions } from '@/queries/statuses/scheduled-statuses';

const messages = defineMessages({
  heading: { id: 'column.scheduled_statuses', defaultMessage: 'Scheduled posts' },
});

const ScheduledStatusesPage = () => {
  const intl = useIntl();

  const { data: scheduledStatuses = [], isLoading, hasNextPage, fetchNextPage } = useInfiniteQuery(scheduledStatusesQueryOptions);

  const emptyMessage = <FormattedMessage id='empty_column.scheduled_statuses' defaultMessage="You don't have any scheduled statuses yet. When you add one, it will show up here." />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        hasMore={hasNextPage}
        isLoading={isLoading}
        onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
        emptyMessageText={emptyMessage}
        listClassName='⁂-status-list'
      >
        {scheduledStatuses.map((status) => <ScheduledStatus key={status.id} scheduledStatus={status} />)}
      </ScrollableList>
    </Column>
  );
};

export { ScheduledStatusesPage as default };
