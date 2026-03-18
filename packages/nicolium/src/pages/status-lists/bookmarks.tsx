import iconDotsThreeVertical from '@phosphor-icons/core/regular/dots-three-vertical.svg';
import iconPencilSimple from '@phosphor-icons/core/regular/pencil-simple.svg';
import iconTrash from '@phosphor-icons/core/regular/trash.svg';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import DropdownMenu from '@/components/dropdown-menu';
import PullToRefresh from '@/components/pull-to-refresh';
import StatusList from '@/components/statuses/status-list';
import Column from '@/components/ui/column';
import { bookmarksRoute } from '@/features/ui/router';
import { useBookmarks } from '@/queries/status-lists/use-bookmarks';
import {
  useBookmarkFolder,
  useDeleteBookmarkFolder,
} from '@/queries/statuses/use-bookmark-folders';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';

const messages = defineMessages({
  heading: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
  editFolder: { id: 'bookmarks.edit_folder', defaultMessage: 'Edit folder' },
  deleteFolder: { id: 'bookmarks.delete_folder', defaultMessage: 'Delete folder' },
  deleteFolderHeading: {
    id: 'confirmations.delete_bookmark_folder.heading',
    defaultMessage: 'Delete "{name}" folder?',
  },
  deleteFolderMessage: {
    id: 'confirmations.delete_bookmark_folder.message',
    defaultMessage:
      'Are you sure you want to delete the folder? The bookmarks will still be stored.',
  },
  deleteFolderConfirm: {
    id: 'confirmations.delete_bookmark_folder.confirm',
    defaultMessage: 'Delete folder',
  },
  deleteFolderSuccess: { id: 'bookmarks.delete_folder.success', defaultMessage: 'Folder deleted' },
  deleteFolderFail: {
    id: 'bookmarks.delete_folder.fail',
    defaultMessage: 'Failed to delete folder',
  },
});

const BookmarksPage: React.FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();

  let folderId: string | undefined = bookmarksRoute.useParams().folderId;
  if (folderId === 'all') folderId = undefined;

  const { openModal } = useModalsActions();
  const { data: folder } = useBookmarkFolder(folderId);
  const { mutate: deleteBookmarkFolder } = useDeleteBookmarkFolder();

  const {
    data: statusIds = [],
    isFetching,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useBookmarks(folderId);

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
            navigate({ to: '/bookmarks' });
          },
          onError() {
            toast.error(messages.deleteFolderFail);
          },
        });
      },
    });
  };

  const emptyMessage = folderId ? (
    <FormattedMessage
      id='empty_column.bookmarks.folder'
      defaultMessage="You don't have any bookmarks in this folder yet. When you add one, it will show up here."
    />
  ) : (
    <FormattedMessage
      id='empty_column.bookmarks'
      defaultMessage="You don't have any bookmarks yet. When you add one, it will show up here."
    />
  );

  const items = folderId
    ? [
        {
          text: intl.formatMessage(messages.editFolder),
          action: handleEditFolder,
          icon: iconPencilSimple,
        },
        {
          text: intl.formatMessage(messages.deleteFolder),
          action: handleDeleteFolder,
          icon: iconTrash,
        },
      ]
    : [];

  return (
    <Column
      label={folder ? folder.name : intl.formatMessage(messages.heading)}
      action={<DropdownMenu items={items} src={iconDotsThreeVertical} />}
    >
      <PullToRefresh onRefresh={handleRefresh}>
        <StatusList
          loadMoreClassName='sm:pb-4 black:sm:pb-0 black:sm:mx-4'
          statusIds={statusIds}
          scrollKey='bookmarked_statuses'
          hasMore={hasNextPage}
          isLoading={isFetching}
          onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
          emptyMessageText={emptyMessage}
        />
      </PullToRefresh>
    </Column>
  );
};

export { BookmarksPage as default };
