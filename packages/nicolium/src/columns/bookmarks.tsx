import React from 'react';
import { FormattedMessage } from 'react-intl';

import PullToRefresh from '@/components/pull-to-refresh';
import StatusList from '@/components/statuses/status-list';
import { useBookmarks } from '@/queries/status-lists/use-bookmarks';

interface IBookmarksColumn {
  folderId?: string;
}

const BookmarksColumn: React.FC<IBookmarksColumn> = ({ folderId }) => {
  const {
    data: statusIds = [],
    isFetching,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useBookmarks(folderId);

  const handleRefresh = () => refetch();

  const emptyMessage = folderId ? (
    <FormattedMessage
      id='empty_column.bookmarks.folder'
      defaultMessage='You don’t have any bookmarks in this folder yet. When you add one, it will show up here.'
    />
  ) : (
    <FormattedMessage
      id='empty_column.bookmarks'
      defaultMessage='You don’t have any bookmarks yet. When you add one, it will show up here.'
    />
  );

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <StatusList
        loadMoreClassName='status-list__load-more'
        statusIds={statusIds}
        scrollKey='bookmarked_statuses'
        hasMore={hasNextPage}
        isLoading={isFetching}
        onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
        emptyMessageText={emptyMessage}
      />
    </PullToRefresh>
  );
};

export { BookmarksColumn };
