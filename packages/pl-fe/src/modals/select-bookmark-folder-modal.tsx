import fuzzysort from 'fuzzysort';
import { BookmarkFolder } from 'pl-api';
import React, { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { ListItem } from 'pl-fe/components/list';
import { RadioGroup, RadioItem } from 'pl-fe/components/radio';
import Emoji from 'pl-fe/components/ui/emoji';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Modal from 'pl-fe/components/ui/modal';
import Spinner from 'pl-fe/components/ui/spinner';
import Stack from 'pl-fe/components/ui/stack';
import Toggle from 'pl-fe/components/ui/toggle';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { NewFolderForm } from 'pl-fe/pages/status-lists/bookmark-folders';
import { useAddBookmarkToFolder, useBookmarkFolders, useRemoveBookmarkFromFolder, useStatusBookmarkFolders } from 'pl-fe/queries/statuses/use-bookmark-folders';
import { useBookmarkStatus } from 'pl-fe/queries/statuses/use-status-interactions';
import { makeGetStatus } from 'pl-fe/selectors';

import type { BaseModalProps } from 'pl-fe/features/ui/components/modal-root';

interface SelectBookmarkFolderModalProps {
  statusId: string;
}

const search = (bookmarkFolders: Array<BookmarkFolder>, term: string) => {
  if (!term) return bookmarkFolders;

  return fuzzysort.go(term, bookmarkFolders, { key: 'name' }).map(result => result.obj);
};

const SelectBookmarkFolderModal: React.FC<SelectBookmarkFolderModalProps & BaseModalProps> = ({ statusId, onClose }) => {
  const getStatus = useCallback(makeGetStatus(), []);
  const status = useAppSelector(state => getStatus(state, { id: statusId }))!;
  const features = useFeatures();

  const [selectedFolder, setSelectedFolder] = useState(status.bookmark_folder);
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const handleSearchChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    setSearchTerm(e.target.value);
  };

  const { isFetching, data: bookmarkFolders } = useBookmarkFolders(data => data);
  const { data: selectedBookmarkFolders, isPending: fetchingSelectedBookmarkFolders } = useStatusBookmarkFolders(statusId);
  const { mutate: addBookmarkToFolder, isPending: addingBookmarkToFolder } = useAddBookmarkToFolder(statusId);
  const { mutate: removeBookmarkFromFolder, isPending: removingBookmarkFromFolder } = useRemoveBookmarkFromFolder(statusId);
  const { mutate: bookmarkStatus } = useBookmarkStatus(status.id);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const folderId = e.target.value;
    setSelectedFolder(folderId);

    bookmarkStatus(folderId, {
      onSuccess: () => onClose('SELECT_BOOKMARK_FOLDER'),
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
    items = (filteredFolders).map((folder) => (
      <ListItem
        key={folder.id}
        label={
          <HStack alignItems='center' space={2}>
            {folder.emoji ? (
              <Emoji
                emoji={folder.emoji}
                src={folder.emoji_url || undefined}
                className='size-5 flex-none'
              />
            ) : <Icon src={require('@phosphor-icons/core/regular/folder-simple.svg')} size={20} />}
            <span>{folder.name}</span>
          </HStack>
        }
      >
        <Toggle
          checked={selectedBookmarkFolders?.includes(folder.id)}
          onChange={() => toggleBookmarkFolder(folder.id)}
          disabled={fetchingSelectedBookmarkFolders || addingBookmarkToFolder || removingBookmarkFromFolder}
        />
      </ListItem>
    ));
  } else {
    items = [
      <RadioItem
        key='all'
        label={
          <HStack alignItems='center' space={2}>
            <Icon src={require('@phosphor-icons/core/regular/bookmarks.svg')} size={20} />
            <span><FormattedMessage id='bookmark_folders.all_bookmarks' defaultMessage='All bookmarks' /></span>
          </HStack>
        }
        checked={selectedFolder === null}
        value=''
      />,
    ];

    if (!isFetching) {
      items.push(...((filteredFolders).map((folder) => (
        <RadioItem
          key={folder.id}
          label={
            <HStack alignItems='center' space={2}>
              {folder.emoji ? (
                <Emoji
                  emoji={folder.emoji}
                  src={folder.emoji_url || undefined}
                  className='size-5 flex-none'
                />
              ) : <Icon src={require('@phosphor-icons/core/regular/folder-simple.svg')} size={20} />}
              <span>{folder.name}</span>
            </HStack>
          }
          checked={selectedFolder === folder.id}
          value={folder.id}
        />
      ))));
    }
  }

  const body = isFetching ? <Spinner /> : (
    <Stack space={4}>
      <NewFolderForm search onChange={handleSearchChange} />

      <RadioGroup onChange={onChange}>
        {items}
      </RadioGroup>
    </Stack>
  );

  return (
    <Modal
      title={<FormattedMessage id='select_bookmark_folder_modal.header_title' defaultMessage='Select folder' />}
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export { type SelectBookmarkFolderModalProps, SelectBookmarkFolderModal as default };
