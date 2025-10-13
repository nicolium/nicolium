import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { Redirect } from 'react-router-dom';

import List, { ListItem } from 'pl-fe/components/list';
import Button from 'pl-fe/components/ui/button';
import Column from 'pl-fe/components/ui/column';
import Emoji from 'pl-fe/components/ui/emoji';
import Form from 'pl-fe/components/ui/form';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Input from 'pl-fe/components/ui/input';
import Spinner from 'pl-fe/components/ui/spinner';
import Stack from 'pl-fe/components/ui/stack';
import { useTextField } from 'pl-fe/hooks/forms/use-text-field';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useBookmarkFolders, useCreateBookmarkFolder } from 'pl-fe/queries/statuses/use-bookmark-folders';
import toast from 'pl-fe/toast';

const messages = defineMessages({
  heading: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
  label: { id: 'bookmark_folders.new.title_placeholder', defaultMessage: 'New folder title' },
  createSuccess: { id: 'bookmark_folders.add.success', defaultMessage: 'Bookmark folder created successfully' },
  createFail: { id: 'bookmark_folders.add.fail', defaultMessage: 'Failed to create bookmark folder' },
});

const NewFolderForm: React.FC = () => {
  const intl = useIntl();

  const name = useTextField();

  const { mutate: createBookmarkFolder, isPending } = useCreateBookmarkFolder();

  const handleSubmit = (e: React.FormEvent<Element>) => {
    e.preventDefault();
    createBookmarkFolder({
      name: name.value,
    }, {
      onSuccess() {
        toast.success(messages.createSuccess);
      },
      onError() {
        toast.success(messages.createFail);
      },
    });
  };

  const label = intl.formatMessage(messages.label);

  return (
    <Form onSubmit={handleSubmit}>
      <HStack space={2} alignItems='center'>
        <label className='grow'>
          <span style={{ display: 'none' }}>{label}</span>

          <Input
            type='text'
            placeholder={label}
            disabled={isPending}
            {...name}
          />
        </label>

        <Button
          disabled={isPending}
          onClick={handleSubmit}
          theme='primary'
        >
          <FormattedMessage id='bookmark_folders.new.create_title' defaultMessage='Add folder' />
        </Button>
      </HStack>
    </Form>
  );
};

const BookmarkFoldersPage: React.FC = () => {
  const intl = useIntl();
  const features = useFeatures();

  const { data: bookmarkFolders, isFetching } = useBookmarkFolders(data => data);

  if (!features.bookmarkFolders) return <Redirect to='/bookmarks/all' />;

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
            to='/bookmarks/all'
            label={
              <HStack alignItems='center' space={2}>
                <Icon src={require('@phosphor-icons/core/regular/bookmarks.svg')} size={20} />
                <span><FormattedMessage id='bookmark_folders.all_bookmarks' defaultMessage='All bookmarks' /></span>
              </HStack>
            }
          />
          {bookmarkFolders?.map((folder) => (
            <ListItem
              key={folder.id}
              to={`/bookmarks/${folder.id}`}
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
            />
          ))}
        </List>
      </Stack>
    </Column>
  );
};

export { BookmarkFoldersPage as default, NewFolderForm };
