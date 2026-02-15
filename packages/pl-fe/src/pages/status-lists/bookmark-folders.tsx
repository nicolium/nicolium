import { Navigate } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import List, { ListItem } from '@/components/list';
import Button from '@/components/ui/button';
import Column from '@/components/ui/column';
import Emoji from '@/components/ui/emoji';
import Form from '@/components/ui/form';
import HStack from '@/components/ui/hstack';
import Icon from '@/components/ui/icon';
import Input from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import Stack from '@/components/ui/stack';
import { useTextField } from '@/hooks/forms/use-text-field';
import { useFeatures } from '@/hooks/use-features';
import {
  useBookmarkFolders,
  useCreateBookmarkFolder,
} from '@/queries/statuses/use-bookmark-folders';
import toast from '@/toast';

const messages = defineMessages({
  heading: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
  label: { id: 'bookmark_folders.new.title_placeholder', defaultMessage: 'New folder title' },
  labelWithSearch: {
    id: 'bookmark_folders.new.title_with_search_placeholder',
    defaultMessage: 'Search or create new folder',
  },
  createSuccess: {
    id: 'bookmark_folders.add.success',
    defaultMessage: 'Bookmark folder created successfully',
  },
  createFail: {
    id: 'bookmark_folders.add.fail',
    defaultMessage: 'Failed to create bookmark folder',
  },
});

interface INewFolderForm {
  search?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

const NewFolderForm: React.FC<INewFolderForm> = ({ search, onChange }) => {
  const intl = useIntl();

  const name = useTextField();

  const { mutate: createBookmarkFolder, isPending } = useCreateBookmarkFolder();

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    name.onChange(e);
    if (onChange) onChange(e);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBookmarkFolder(
      {
        name: name.value,
      },
      {
        onSuccess() {
          toast.success(messages.createSuccess);
        },
        onError() {
          toast.success(messages.createFail);
        },
      },
    );
  };

  const label = intl.formatMessage(search ? messages.labelWithSearch : messages.label);

  return (
    <Form onSubmit={handleSubmit}>
      <HStack space={2} alignItems='center'>
        <Input
          outerClassName='grow'
          type='text'
          placeholder={label}
          title={label}
          disabled={isPending}
          {...name}
          onChange={handleChange}
        />

        <Button disabled={isPending} onClick={handleSubmit} theme='primary'>
          <FormattedMessage id='bookmark_folders.new.create_title' defaultMessage='Add folder' />
        </Button>
      </HStack>
    </Form>
  );
};

const BookmarkFoldersPage: React.FC = () => {
  const intl = useIntl();
  const features = useFeatures();

  const { data: bookmarkFolders, isFetching } = useBookmarkFolders((data) => data);

  if (!features.bookmarkFolders)
    return <Navigate to='/bookmarks/$folderId' params={{ folderId: 'all' }} replace />;

  if (isFetching) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Stack space={4}>
        <NewFolderForm />

        <List>
          <ListItem
            to='/bookmarks/$folderId'
            params={{ folderId: 'all' }}
            label={
              <HStack alignItems='center' space={2}>
                <Icon src={require('@phosphor-icons/core/regular/bookmarks.svg')} size={20} />
                <span>
                  <FormattedMessage
                    id='bookmark_folders.all_bookmarks'
                    defaultMessage='All bookmarks'
                  />
                </span>
              </HStack>
            }
          />
          {bookmarkFolders?.map((folder) => (
            <ListItem
              key={folder.id}
              to='/bookmarks/$folderId'
              params={{ folderId: folder.id }}
              label={
                <HStack alignItems='center' space={2}>
                  {folder.emoji ? (
                    <Emoji
                      emoji={folder.emoji}
                      src={folder.emoji_url ?? undefined}
                      className='size-5 flex-none'
                    />
                  ) : (
                    <Icon
                      src={require('@phosphor-icons/core/regular/folder-simple.svg')}
                      size={20}
                    />
                  )}
                  <span>{folder.name}</span>
                </HStack>
              }
            />
          ))}
        </List>
      </Stack>
    </Column>
  );
};

export { BookmarkFoldersPage as default, NewFolderForm };
