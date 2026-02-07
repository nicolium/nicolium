import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import PullToRefresh from '@/components/pull-to-refresh';
import StatusList from '@/components/status-list';
import Column from '@/components/ui/column';
import { statusQuotesRoute } from '@/features/ui/router';
import { useStatusQuotes } from '@/queries/statuses/use-status-quotes';

const messages = defineMessages({
  heading: { id: 'column.quotes', defaultMessage: 'Post quotes' },
});

const QuotesPage: React.FC = () => {
  const intl = useIntl();
  const { statusId } = statusQuotesRoute.useParams();

  const { data: statusIds = [], isLoading, hasNextPage, fetchNextPage, refetch } = useStatusQuotes(statusId);

  const handleRefresh = async () => {
    await refetch();
  };

  const handleLoadMore = () => {
    fetchNextPage({ cancelRefetch: false });
  };

  const emptyMessage = <FormattedMessage id='empty_column.quotes' defaultMessage='This post has not been quoted yet.' />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <PullToRefresh onRefresh={handleRefresh}>
        <StatusList
          loadMoreClassName='sm:pb-4 black:sm:pb-0 black:sm:mx-4'
          statusIds={statusIds}
          scrollKey={`quotes:${statusId}`}
          hasMore={hasNextPage}
          isLoading={typeof isLoading === 'boolean' ? isLoading : true}
          onLoadMore={handleLoadMore}
          emptyMessageText={emptyMessage}
        />
      </PullToRefresh>
    </Column>
  );
};

export { QuotesPage as default };
