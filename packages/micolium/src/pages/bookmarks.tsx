import { Appbar, Text } from '@mkljczk/react-native-paper';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { DotsThreeIcon } from 'phosphor-react-native/src/icons/DotsThree';
import { DotsThreeVerticalIcon } from 'phosphor-react-native/src/icons/DotsThreeVertical';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Alert, Platform, View } from 'react-native';
import { toast } from 'sonner-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { CreateListDialog } from '@/components/create-list-dialog';
import { StatusesList } from '@/components/statuses/statuses-list';
import { Emoji } from '@/components/ui/emoji';
import { HeaderBackButton, HeaderIconButton } from '@/components/ui/header-icon-button';
import { useFeatures } from '@/contexts/current-account-context';
import { useBookmarks } from '@/queries/status-lists/use-bookmarks';
import {
  useBookmarkFolder,
  useDeleteBookmarkFolder,
} from '@/queries/statuses/use-bookmark-folders';

import type { BookmarksStackParams } from '@/router/router';

const messages = defineMessages({
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
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
  menuTitle: { id: 'dropdown_menu.title', defaultMessage: 'Menu' },
});

const AllBookmarksScreen = ({
  navigation,
}: NativeStackScreenProps<BookmarksStackParams, 'all'>) => {
  const features = useFeatures();
  const bookmarksQuery = useBookmarks();

  return (
    <>
      <Appbar.Header mode='small'>
        {navigation.canGoBack() ? <HeaderBackButton onPress={navigation.goBack} /> : null}

        <Appbar.Content
          title={
            <Text variant='titleLarge'>
              {features.bookmarkFolders ? (
                <FormattedMessage id='column.bookmarks.all' defaultMessage='All bookmarks' />
              ) : (
                <FormattedMessage id='column.bookmarks' defaultMessage='Bookmarks' />
              )}
            </Text>
          }
        />
      </Appbar.Header>
      <StatusesList
        query={bookmarksQuery}
        emptyMessageText={
          <FormattedMessage
            id='empty_column.bookmarks'
            defaultMessage='You don’t have any bookmarks yet. When you add one, it will show up here.'
          />
        }
      />
    </>
  );
};

const BookmarksFolderScreen = ({
  route,
  navigation,
}: NativeStackScreenProps<BookmarksStackParams, 'folder'>) => {
  const intl = useIntl();

  const bookmarksQuery = useBookmarks(route.params.id);
  const { data: folder } = useBookmarkFolder(route.params.id);

  const { mutate: deleteFolder } = useDeleteBookmarkFolder();

  const handleDelete = () => {
    Alert.alert(
      intl.formatMessage(messages.deleteFolderHeading),
      intl.formatMessage(messages.deleteFolderMessage),
      [
        {
          text: intl.formatMessage(messages.cancel),
          style: 'cancel',
        },
        {
          text: intl.formatMessage(messages.deleteFolderConfirm),
          style: 'destructive',
          onPress: () =>
            deleteFolder(route.params.id, {
              onSuccess: () => toast.success(intl.formatMessage(messages.deleteFolderSuccess)),
              onError: () => toast.success(intl.formatMessage(messages.deleteFolderFail)),
            }),
        },
      ],
    );
  };

  const [editDialog, setEditDialog] = React.useState(false);

  return (
    <>
      <Appbar.Header mode='small'>
        {navigation.canGoBack() ? <HeaderBackButton onPress={navigation.goBack} /> : null}

        <Appbar.Content
          title={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {folder?.emoji && <Emoji emoji={folder.emoji} url={folder.emoji_url || undefined} />}
              <Text variant='titleLarge'>{folder?.name}</Text>
            </View>
          }
        />

        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <HeaderIconButton
              icon={Platform.OS === 'ios' ? DotsThreeIcon : DotsThreeVerticalIcon}
              accessibilityLabel={intl.formatMessage(messages.menuTitle)}
            />
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item key='edit' onSelect={() => setEditDialog(true)}>
              <DropdownMenu.ItemIcon
                ios={{ name: 'pencil' }}
                androidIconName={'ph_pencil_simple'}
              />
              <DropdownMenu.ItemTitle>
                {intl.formatMessage(messages.editFolder)}
              </DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
            <DropdownMenu.Item key='delete' onSelect={handleDelete} destructive>
              <DropdownMenu.ItemIcon ios={{ name: 'trash' }} androidIconName={'ph_trash'} />
              <DropdownMenu.ItemTitle>
                {intl.formatMessage(messages.deleteFolder)}
              </DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Appbar.Header>
      <StatusesList
        query={bookmarksQuery}
        emptyMessageText={
          <FormattedMessage
            id='empty_column.bookmarks.folder'
            defaultMessage='You don’t have any bookmarks in this folder yet. When you add one, it will show up here.'
          />
        }
      />
      {editDialog && (
        <CreateListDialog
          type='bookmark_folder'
          id={route.params.id}
          visible
          onDismiss={() => setEditDialog(false)}
        />
      )}
    </>
  );
};

const BookmarksStack = createNativeStackNavigator<BookmarksStackParams>();

const BookmarksStackScreen = () => {
  return (
    <BookmarksStack.Navigator screenOptions={{ headerShown: false }}>
      <BookmarksStack.Screen name='all' component={AllBookmarksScreen} />
      <BookmarksStack.Screen name='folder' component={BookmarksFolderScreen} />
    </BookmarksStack.Navigator>
  );
};

export { BookmarksStackScreen };
