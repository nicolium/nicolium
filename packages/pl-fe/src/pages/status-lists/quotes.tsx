import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';

import PullToRefresh from 'pl-fe/components/pull-to-refresh';
import StatusList from 'pl-fe/components/status-list';
import Column from 'pl-fe/components/ui/column';
import { useStatusQuotes } from 'pl-fe/queries/statuses/use-status-quotes';

const messages = defineMessages({
  heading: { id: 'column.quotes', defaultMessage: 'Post quotes' },
});

const QuotesPage: React.FC = () => {
  const intl = useIntl();
  const { statusId } = useParams<{ statusId: string }>();

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
          loadMoreClassName='black:sm:mx-4'
          statusIds={statusIds}
          scrollKey={`quotes:${statusId}`}
          hasMore={hasNextPage}
          isLoading={typeof isLoading === 'boolean' ? isLoading : true}
          onLoadMore={handleLoadMore}
          emptyMessage={emptyMessage}
        />
      </PullToRefresh>
    </Column>
  );
};

export { QuotesPage as default };
