import { Divider, useTheme } from '@mkljczk/react-native-paper';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';

import { Account } from '@/components/accounts/account';
import { Status } from '@/components/statuses/status';
import { Header } from '@/components/ui/header';
import { useStatus } from '@/queries/statuses/use-status';
import {
  useStatusDislikes,
  useStatusFavourites,
  useStatusReblogs,
} from '@/queries/statuses/use-status-interactions';
import { useThread } from '@/stores/contexts';

import type { RootStackParams, StatusStackParams } from '../router';

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
  const { data: reblogs } = useStatusReblogs(id);

  return (
    <FlashList
      data={reblogs}
      renderItem={({ item }) => (
        <Account id={item} style={{ paddingVertical: 8, padding: 12 }} withLink />
      )}
      ItemSeparatorComponent={Divider}
    />
  );
};

const StatusFavouritesScreen = ({
  route: {
    params: { id },
  },
}: NativeStackScreenProps<StatusStackParams, 'favourites'>) => {
  const { data: favourites } = useStatusFavourites(id);

  return (
    <FlashList
      data={favourites}
      renderItem={({ item }) => (
        <Account id={item} style={{ paddingVertical: 8, padding: 12 }} withLink />
      )}
      ItemSeparatorComponent={Divider}
    />
  );
};

const StatusDislikesScreen = ({
  route: {
    params: { id },
  },
}: NativeStackScreenProps<StatusStackParams, 'dislikes'>) => {
  const { data: dislikes } = useStatusDislikes(id);

  return (
    <FlashList
      data={dislikes}
      renderItem={({ item }) => (
        <Account id={item} style={{ paddingVertical: 8, padding: 12 }} withLink />
      )}
      ItemSeparatorComponent={Divider}
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
