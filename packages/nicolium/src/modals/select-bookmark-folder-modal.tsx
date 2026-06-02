import iconBookmarks from '@phosphor-icons/core/regular/bookmarks.svg';
import iconFolderSimple from '@phosphor-icons/core/regular/folder-simple.svg';
import fuzzysort from 'fuzzysort';
import React, { useDeferredValue, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { ListItem } from '@/components/list';
import Emoji from '@/components/ui/emoji';
import Icon from '@/components/ui/icon';
import Modal from '@/components/ui/modal';
import { RadioGroup, RadioItem } from '@/components/ui/radio';
import Spinner from '@/components/ui/spinner';
import Toggle from '@/components/ui/toggle';
import { useFeatures } from '@/hooks/use-features';
import { NewFolderForm } from '@/pages/status-lists/bookmark-folders';
import {
  useAddBookmarkToFolder,
  useBookmarkFolders,
  useRemoveBookmarkFromFolder,
  useStatusBookmarkFolders,
} from '@/queries/statuses/use-bookmark-folders';
import { useMinimalStatus } from '@/queries/statuses/use-status';
import { useBookmarkStatus } from '@/queries/statuses/use-status-interactions';

import type { BaseModalProps } from '@/features/ui/components/modal-root';
import type { BookmarkFolder } from 'pl-api';

interface SelectBookmarkFolderModalProps {
  statusId: string;
}

const search = (bookmarkFolders: Array<BookmarkFolder>, term: string) => {
  if (!term) return bookmarkFolders;

  return fuzzysort.go(term, bookmarkFolders, { key: 'name' }).map((result) => result.obj);
};

const SelectBookmarkFolderModal: React.FC<SelectBookmarkFolderModalProps & BaseModalProps> = ({
  statusId,
  onClose,
}) => {
  const { data: status } = useMinimalStatus(statusId);
  const features = useFeatures();

  const [selectedFolder, setSelectedFolder] = useState(status?.bookmark_folder ?? null);
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const handleSearchChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearchTerm(e.target.value);
  };

  const { isFetching, data: bookmarkFolders } = useBookmarkFolders();
  const { data: selectedBookmarkFolders, isPending: fetchingSelectedBookmarkFolders } =
    useStatusBookmarkFolders(statusId);
  const { mutate: addBookmarkToFolder, isPending: addingBookmarkToFolder } =
    useAddBookmarkToFolder(statusId);
  const { mutate: removeBookmarkFromFolder, isPending: removingBookmarkFromFolder } =
    useRemoveBookmarkFromFolder(statusId);
  const { mutate: bookmarkStatus } = useBookmarkStatus(statusId);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const folderId = e.target.value;
    setSelectedFolder(folderId);

    bookmarkStatus(folderId, {
      onSuccess: () => {
        onClose('SELECT_BOOKMARK_FOLDER');
      },
    });
  };

  const onClickClose = () => {
    onClose('SELECT_BOOKMARK_FOLDER');
  };

  const toggleBookmarkFolder = (folderId: string) => {
    if (selectedBookmarkFolders?.includes(folderId)) {
      removeBookmarkFromFolder(folderId);
    } else {
      addBookmarkToFolder(folderId);
    }
  };

  const filteredFolders = useMemo(() => {
    if (!bookmarkFolders) return [];

    const filtered = search(bookmarkFolders, deferredSearchTerm);

    return filtered;
  }, [bookmarkFolders, deferredSearchTerm]);

  let items;

  if (features.bookmarkFoldersMultiple) {
    items = filteredFolders.map((folder) => (
      <ListItem
        key={folder.id}
        label={
          <div className='bookmark-folder'>
            {folder.emoji ? (
              <Emoji emoji={folder.emoji} src={folder.emoji_url ?? undefined} />
            ) : (
              <Icon src={iconFolderSimple} size={20} />
            )}
            <span>{folder.name}</span>
          </div>
        }
      >
        <Toggle
          checked={selectedBookmarkFolders?.includes(folder.id)}
          onChange={() => {
            toggleBookmarkFolder(folder.id);
          }}
          disabled={
            fetchingSelectedBookmarkFolders || addingBookmarkToFolder || removingBookmarkFromFolder
          }
        />
      </ListItem>
    ));
  } else {
    items = [
      <RadioItem
        key='all'
        label={
          <div className='bookmark-folder'>
            <Icon src={iconBookmarks} size={20} />
            <span>
              <FormattedMessage
                id='bookmark_folders.all_bookmarks'
                defaultMessage='All bookmarks'
              />
            </span>
          </div>
        }
        checked={selectedFolder === null}
        value=''
      />,
    ];

    if (!isFetching) {
      items.push(
        ...filteredFolders.map((folder) => (
          <RadioItem
            key={folder.id}
            label={
              <div className='bookmark-folder'>
                {folder.emoji ? (
                  <Emoji emoji={folder.emoji} src={folder.emoji_url ?? undefined} />
                ) : (
                  <Icon src={iconFolderSimple} size={20} />
                )}
                <span>{folder.name}</span>
              </div>
            }
            checked={selectedFolder === folder.id}
            value={folder.id}
          />
        )),
      );
    }
  }

  const body = isFetching ? (
    <Spinner />
  ) : (
    <div className='select-bookmark-folder-modal'>
      <NewFolderForm search onChange={handleSearchChange} />

      <RadioGroup onChange={onChange}>{items}</RadioGroup>
    </div>
  );

  return (
    <Modal
      title={
        <FormattedMessage
          id='select_bookmark_folder_modal.header.title'
          defaultMessage='Select folder'
        />
      }
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export { type SelectBookmarkFolderModalProps, SelectBookmarkFolderModal as default };
