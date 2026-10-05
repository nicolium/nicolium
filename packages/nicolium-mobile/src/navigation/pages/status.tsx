import { ActivityIndicator, Divider, useTheme } from '@mkljczk/react-native-paper';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Account } from '@/components/accounts/account';
import { Status } from '@/components/statuses/status';
import { EmptyMessage } from '@/components/ui/empty-message';
import { Header } from '@/components/ui/header';
import { useStatus } from '@/queries/statuses/use-status';
import {
  useStatusDislikes,
  useStatusFavourites,
  useStatusReblogs,
} from '@/queries/statuses/use-status-interactions';
import { useThread } from '@/stores/contexts';

import type { RootStackParams, StatusStackParams } from '../router';
import type { PaginatedResponseArray } from '@/queries/utils/make-paginated-response-query';
import type { UseInfiniteQueryResult } from '@tanstack/react-query';

interface IInteractionList {
  query: UseInfiniteQueryResult<PaginatedResponseArray<string>, Error>;
  emptyMessageText?: React.JSX.Element;
}

const InteractionList: React.FC<IInteractionList> = ({ query, emptyMessageText }) => {
  return (
    <FlashList
      data={query.data}
      renderItem={({ item }) => (
        <Account id={item} style={{ paddingVertical: 8, padding: 12 }} withLink />
      )}
      ItemSeparatorComponent={Divider}
      onEndReached={query.hasNextPage && !query.isFetching ? query.fetchNextPage : undefined}
      onEndReachedThreshold={0.1}
      ListEmptyComponent={
        !query.isPending ? <EmptyMessage emptyMessageText={emptyMessageText} /> : null
      }
      ListFooterComponent={
        query.isFetching ? <ActivityIndicator style={{ marginVertical: 8 }} /> : undefined
      }
    />
  );
};

const StatusViewScreen = ({
  route: {
    params: { id },
  },
}: NativeStackScreenProps<StatusStackParams, 'view'>) => {
  const { colors } = useTheme();
  useStatus(id, { withContext: true });
  const thread = useThread(id);

  return (
    <FlashList
      data={thread}
      renderItem={({ item }) => (
        <Status
          id={item}
          context='thread'
          withLink={item !== id}
          style={item === id ? { backgroundColor: colors.surfaceContainerLow } : undefined}
          detailed={item === id}
        />
      )}
      ItemSeparatorComponent={Divider}
      initialScrollIndex={thread.indexOf(id)}
    />
  );
};

const StatusReblogsScreen = ({
  route: {
    params: { id },
  },
}: NativeStackScreenProps<StatusStackParams, 'reblogs'>) => {
  const query = useStatusReblogs(id);

  return (
    <InteractionList
      query={query}
      emptyMessageText={
        <FormattedMessage
          id='status.reblogs.empty'
          defaultMessage='No one has reposted this post yet. When someone does, they will show up here.'
        />
      }
    />
  );
};

const StatusFavouritesScreen = ({
  route: {
    params: { id },
  },
}: NativeStackScreenProps<StatusStackParams, 'favourites'>) => {
  const query = useStatusFavourites(id);

  return (
    <InteractionList
      query={query}
      emptyMessageText={
        <FormattedMessage
          id='empty_column.favourites'
          defaultMessage='No one has liked this post yet. When someone does, they will show up here.'
        />
      }
    />
  );
};

const StatusDislikesScreen = ({
  route: {
    params: { id },
  },
}: NativeStackScreenProps<StatusStackParams, 'dislikes'>) => {
  const query = useStatusDislikes(id);

  return (
    <InteractionList
      query={query}
      emptyMessageText={
        <FormattedMessage
          id='empty_column.dislikes'
          defaultMessage='No one has disliked this post yet. When someone does, they will show up here.'
        />
      }
    />
  );
};

const StatusStack = createNativeStackNavigator<StatusStackParams>();

const StatusStackScreen = (_props: NativeStackScreenProps<RootStackParams, 'status'>) => {
  return (
    <StatusStack.Navigator>
      <StatusStack.Screen
        name='view'
        component={StatusViewScreen}
        options={{ header: Header, title: 'Status' }}
      />
      <StatusStack.Screen
        name='reblogs'
        component={StatusReblogsScreen}
        options={{ header: Header, title: 'Reposts' }}
      />
      <StatusStack.Screen
        name='favourites'
        component={StatusFavouritesScreen}
        options={{ header: Header, title: 'Likes' }}
      />
      <StatusStack.Screen
        name='dislikes'
        component={StatusDislikesScreen}
        options={{ header: Header, title: 'Dislikes' }}
      />
    </StatusStack.Navigator>
  );
};

export { StatusViewScreen, StatusStackScreen };
