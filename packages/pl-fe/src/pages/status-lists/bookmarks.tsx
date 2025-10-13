import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import DropdownMenu from 'pl-fe/components/dropdown-menu';
import PullToRefresh from 'pl-fe/components/pull-to-refresh';
import StatusList from 'pl-fe/components/status-list';
import Column from 'pl-fe/components/ui/column';
import { useBookmarks } from 'pl-fe/queries/status-lists/use-bookmarks';
import { useBookmarkFolder, useDeleteBookmarkFolder } from 'pl-fe/queries/statuses/use-bookmark-folders';
import { useModalsStore } from 'pl-fe/stores/modals';
import toast from 'pl-fe/toast';

const messages = defineMessages({
  heading: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
  editFolder: { id: 'bookmarks.edit_folder', defaultMessage: 'Edit folder' },
  deleteFolder: { id: 'bookmarks.delete_folder', defaultMessage: 'Delete folder' },
  deleteFolderHeading: { id: 'confirmations.delete_bookmark_folder.heading', defaultMessage: 'Delete "{name}" folder?' },
  deleteFolderMessage: { id: 'confirmations.delete_bookmark_folder.message', defaultMessage: 'Are you sure you want to delete the folder? The bookmarks will still be stored.' },
  deleteFolderConfirm: { id: 'confirmations.delete_bookmark_folder.confirm', defaultMessage: 'Delete folder' },
  deleteFolderSuccess: { id: 'bookmarks.delete_folder.success', defaultMessage: 'Folder deleted' },
  deleteFolderFail: { id: 'bookmarks.delete_folder.fail', defaultMessage: 'Failed to delete folder' },
});

interface IBookmarks {
  params?: {
    id?: string;
  };
}

const BookmarksPage: React.FC<IBookmarks> = ({ params }) => {
  const intl = useIntl();
  const history = useHistory();

  const folderId = params?.id;

  const { openModal } = useModalsStore();
  const { data: folder } = useBookmarkFolder(folderId);
  const { mutate: deleteBookmarkFolder } = useDeleteBookmarkFolder();

  const { data: statusIds = [], isFetching, hasNextPage, fetchNextPage, refetch } = useBookmarks(folderId);

  const handleRefresh = () => refetch();

  const handleEditFolder = () => {
    if (!folderId) return;
    openModal('EDIT_BOOKMARK_FOLDER', { folderId });
  };

  const handleDeleteFolder = () => {
    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.deleteFolderHeading, { name: folder?.name }),
      message: intl.formatMessage(messages.deleteFolderMessage),
      confirm: intl.formatMessage(messages.deleteFolderConfirm),
      onConfirm: () => {
        deleteBookmarkFolder(folderId!, {
          onSuccess() {
            toast.success(messages.deleteFolderSuccess);
            history.push('/bookmarks');
          },
          onError() {
            toast.error(messages.deleteFolderFail);
          },
        });
      },
    });
  };

  const emptyMessage = folderId
    ? <FormattedMessage id='empty_column.bookmarks.folder' defaultMessage="You don't have any bookmarks in this folder yet. When you add one, it will show up here." />
    : <FormattedMessage id='empty_column.bookmarks' defaultMessage="You don't have any bookmarks yet. When you add one, it will show up here." />;

  const items = folderId ? [
    {
      text: intl.formatMessage(messages.editFolder),
      action: handleEditFolder,
      icon: require('@phosphor-icons/core/regular/pencil-simple.svg'),
    },
    {
      text: intl.formatMessage(messages.deleteFolder),
      action: handleDeleteFolder,
      icon: require('@phosphor-icons/core/regular/trash.svg'),
    },
  ] : [];

  return (
    <Column
      label={folder ? folder.name : intl.formatMessage(messages.heading)}
      action={<DropdownMenu items={items} src={require('@tabler/icons/outline/dots-vertical.svg')} />}
    >
      <PullToRefresh onRefresh={handleRefresh}>
        <StatusList
          loadMoreClassName='sm:pb-4 black:sm:pb-0 black:sm:mx-4'
          statusIds={statusIds}
          scrollKey='bookmarked_statuses'
          hasMore={hasNextPage}
          isLoading={isFetching}
          onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
          emptyMessage={emptyMessage}
        />
      </PullToRefresh>
    </Column>
  );
};

export { BookmarksPage as default };
