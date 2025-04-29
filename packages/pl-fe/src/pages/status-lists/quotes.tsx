import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';

import PullToRefresh from 'pl-fe/components/pull-to-refresh';
import StatusList from 'pl-fe/components/status-list';
import Column from 'pl-fe/components/ui/column';
import { useIsMobile } from 'pl-fe/hooks/use-is-mobile';
import { useTheme } from 'pl-fe/hooks/use-theme';
import { useStatusQuotes } from 'pl-fe/queries/statuses/use-status-quotes';

const messages = defineMessages({
  heading: { id: 'column.quotes', defaultMessage: 'Post quotes' },
});

const QuotesPage: React.FC = () => {
  const intl = useIntl();
  const { statusId } = useParams<{ statusId: string }>();
  const theme = useTheme();
  const isMobile = useIsMobile();

  const { data: statusIds = [], isLoading, hasNextPage, fetchNextPage, refetch } = useStatusQuotes(statusId);

  const handleRefresh = async () => {
    await refetch();
  };

  const handleLoadMore = () => {
    fetchNextPage({ cancelRefetch: false });
  };

  const emptyMessage = <FormattedMessage id='empty_column.quotes' defaultMessage='This post has not been quoted yet.' />;

  return (
    <Column label={intl.formatMessage(messages.heading)} transparent={!isMobile}>
      <PullToRefresh onRefresh={handleRefresh}>
        <StatusList
          className='black:p-0 black:sm:p-4 black:sm:pt-0'
          loadMoreClassName='black:sm:mx-4'
          statusIds={statusIds}
          scrollKey={`quotes:${statusId}`}
          hasMore={hasNextPage}
          isLoading={typeof isLoading === 'boolean' ? isLoading : true}
          onLoadMore={handleLoadMore}
          emptyMessage={emptyMessage}
          divideType={(theme === 'black' || isMobile) ? 'border' : 'space'}
        />
      </PullToRefresh>
    </Column>
  );
};

export { QuotesPage as default };
