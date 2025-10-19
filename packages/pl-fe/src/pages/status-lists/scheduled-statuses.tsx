import { useInfiniteQuery } from '@tanstack/react-query';
import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import ScrollableList from 'pl-fe/components/scrollable-list';
import Column from 'pl-fe/components/ui/column';
import ScheduledStatus from 'pl-fe/features/scheduled-statuses/components/scheduled-status';
import { scheduledStatusesQueryOptions } from 'pl-fe/queries/statuses/scheduled-statuses';

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
        isLoading={typeof isLoading === 'boolean' ? isLoading : true}
        onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
        emptyMessageText={emptyMessage}
        listClassName='divide-y divide-solid divide-gray-200 black:divide-gray-800 dark:divide-primary-800'
      >
        {scheduledStatuses.map((status) => <ScheduledStatus key={status.id} scheduledStatus={status} />)}
      </ScrollableList>
    </Column>
  );
};

export { ScheduledStatusesPage as default };
