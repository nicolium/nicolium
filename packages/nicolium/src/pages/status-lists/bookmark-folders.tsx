import iconBookmarks from '@phosphor-icons/core/regular/bookmarks.svg';
import iconFolderSimple from '@phosphor-icons/core/regular/folder-simple.svg';
import { Navigate } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import List, { ListItem } from '@/components/list';
import Button from '@/components/ui/button';
import Column from '@/components/ui/column';
import Emoji from '@/components/ui/emoji';
import Form from '@/components/ui/form';
import Icon from '@/components/ui/icon';
import Input from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import { useTextField } from '@/hooks/forms/use-text-field';
import { useFeatures } from '@/hooks/use-features';
import {
  useBookmarkFolders,
  useCreateBookmarkFolder,
} from '@/queries/statuses/use-bookmark-folders';
import toast from '@/toast';

const messages = defineMessages({
  heading: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
  label: { id: 'bookmark_folders.new.title.placeholder', defaultMessage: 'New folder title' },
  labelWithSearch: {
    id: 'bookmark_folders.new.title_with_search.placeholder',
    defaultMessage: 'Search or create new folder',
  },
  createSuccess: {
    id: 'bookmark_folders.add.success',
    defaultMessage: 'Bookmark folder created',
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

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
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
          toast.error(messages.createFail);
        },
      },
    );
  };

  const label = intl.formatMessage(search ? messages.labelWithSearch : messages.label);

  return (
    <Form onSubmit={handleSubmit}>
      <div className='flex items-center gap-2'>
        <Input
          outerClassName='grow'
          type='text'
          placeholder={label}
          title={label}
          disabled={isPending}
          {...name}
          onChange={handleChange}
        />

        <Button disabled={isPending} type='submit' theme='primary'>
          <FormattedMessage id='bookmark_folders.new.create.title' defaultMessage='Add folder' />
        </Button>
      </div>
    </Form>
  );
};

const BookmarkFoldersPage: React.FC = () => {
  const intl = useIntl();
  const features = useFeatures();

  const { data: bookmarkFolders, isFetching } = useBookmarkFolders();

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
      <div className='flex flex-col gap-4'>
        <NewFolderForm />

        <List>
          <ListItem
            to='/bookmarks/$folderId'
            params={{ folderId: 'all' }}
            label={
              <div className='flex items-center gap-2'>
                <Icon src={iconBookmarks} size={20} />
                <span>
                  <FormattedMessage
                    id='bookmark_folders.all_bookmarks'
                    defaultMessage='All bookmarks'
                  />
                </span>
              </div>
            }
          />
          {bookmarkFolders?.map((folder) => (
            <ListItem
              key={folder.id}
              to='/bookmarks/$folderId'
              params={{ folderId: folder.id }}
              label={
                <div className='flex items-center gap-2'>
                  {folder.emoji ? (
                    <Emoji
                      emoji={folder.emoji}
                      src={folder.emoji_url ?? undefined}
                      className='size-5 flex-none'
                    />
                  ) : (
                    <Icon src={iconFolderSimple} size={20} />
                  )}
                  <span>{folder.name}</span>
                </div>
              }
            />
          ))}
        </List>
      </div>
    </Column>
  );
};

export { BookmarkFoldersPage as default, NewFolderForm };
