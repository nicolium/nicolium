import { ActivityIndicator, Appbar, Divider, Text } from '@mkljczk/react-native-paper';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { FormattedMessage } from 'react-intl';

import { Status } from '@/components/statuses/status';
import { EmptyMessage } from '@/components/ui/empty-message';
import { LoadMore } from '@/components/ui/load-more';
import { useFeatures } from '@/contexts/current-account-context';
import { useBookmarks } from '@/queries/status-lists/use-bookmarks';
import { useBookmarkFolder } from '@/queries/statuses/use-bookmark-folders';
import { useSetting } from '@/stores/settings';

import type { BookmarksStackParams } from '../router';

const AllBookmarksScreen = ({
  navigation,
}: NativeStackScreenProps<BookmarksStackParams, 'all'>) => {
  const autoloadMore = useSetting('timelines.autoloadMore');
  const features = useFeatures();

  const bookmarksQuery = useBookmarks();

  return (
    <>
      <Appbar.Header>
        {navigation.canGoBack() ? <Appbar.BackAction onPress={navigation.goBack} /> : null}

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
      <FlashList
        data={bookmarksQuery.data}
        renderItem={({ item }) => <Status id={item} withLink />}
        ItemSeparatorComponent={Divider}
        onEndReached={
          autoloadMore && bookmarksQuery.hasNextPage && !bookmarksQuery.isFetching
            ? bookmarksQuery.fetchNextPage
            : undefined
        }
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          !bookmarksQuery.isPending ? (
            <EmptyMessage
              emptyMessageText={
                <FormattedMessage
                  id='empty_column.bookmarks'
                  defaultMessage='You don’t have any bookmarks yet. When you add one, it will show up here.'
                />
              }
            />
          ) : null
        }
        ListFooterComponent={<LoadMore query={bookmarksQuery} />}
      />
    </>
  );
};

const BookmarksFolderScreen = ({
  route,
  navigation,
}: NativeStackScreenProps<BookmarksStackParams, 'folder'>) => {
  const autoloadMore = useSetting('timelines.autoloadMore');

  const bookmarksQuery = useBookmarks(route.params.id);
  const { data: folder } = useBookmarkFolder(route.params.id);

  return (
    <>
      <Appbar.Header>
        {navigation.canGoBack() ? <Appbar.BackAction onPress={navigation.goBack} /> : null}

        <Appbar.Content title={<Text variant='titleLarge'>{folder?.name}</Text>} />
      </Appbar.Header>
      <FlashList
        data={bookmarksQuery.data}
        renderItem={({ item }) => <Status id={item} withLink />}
        ItemSeparatorComponent={Divider}
        onEndReached={
          autoloadMore && bookmarksQuery.hasNextPage && !bookmarksQuery.isFetching
            ? bookmarksQuery.fetchNextPage
            : undefined
        }
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          !bookmarksQuery.isPending ? (
            <EmptyMessage
              emptyMessageText={
                <FormattedMessage
                  id='empty_column.bookmarks.folder'
                  defaultMessage='You don’t have any bookmarks in this folder yet. When you add one, it will show up here.'
                />
              }
            />
          ) : null
        }
        ListFooterComponent={<LoadMore query={bookmarksQuery} />}
      />
    </>
  );
};

const BookmarksStack = createNativeStackNavigator<BookmarksStackParams>();

const BookmarksStackScreen = () => {
  return (
    <BookmarksStack.Navigator>
      <BookmarksStack.Screen
        name='all'
        component={AllBookmarksScreen}
        options={{ headerShown: false, title: 'Bookmarks' }}
      />
      <BookmarksStack.Screen
        name='folder'
        component={BookmarksFolderScreen}
        options={{ headerShown: false, title: 'Bookmarks' }}
      />
    </BookmarksStack.Navigator>
  );
};

export { BookmarksStackScreen };
