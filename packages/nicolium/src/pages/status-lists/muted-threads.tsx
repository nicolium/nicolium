import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import PullToRefresh from '@/components/pull-to-refresh';
import StatusList from '@/components/statuses/status-list';
import Column from '@/components/ui/column';
import { useMutedThreads } from '@/queries/status-lists/use-muted-threads';

const messages = defineMessages({
  heading: { id: 'column.muted_threads', defaultMessage: 'Muted conversations' },
});

const QuotesPage: React.FC = () => {
  const intl = useIntl();

  const {
    data: statusIds = [],
    isLoading,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useMutedThreads();

  const handleRefresh = async () => {
    await refetch();
  };

  const handleLoadMore = () => {
    fetchNextPage({ cancelRefetch: false });
  };

  const emptyMessage = (
    <FormattedMessage
      id='empty_column.muted_threads'
      defaultMessage='You have not muted any conversations yet.'
    />
  );

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <PullToRefresh onRefresh={handleRefresh}>
        <StatusList
          loadMoreClassName='status-list__load-more'
          statusIds={statusIds}
          scrollKey='muted_threads'
          hasMore={hasNextPage}
          isLoading={isLoading}
          onLoadMore={handleLoadMore}
          emptyMessageText={emptyMessage}
        />
      </PullToRefresh>
    </Column>
  );
};

export { QuotesPage as default };
