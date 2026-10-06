import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuthStore } from '@/stores/auth';

import { Header } from '../components/ui/header';

import { AccountsStackScreen } from './pages/accounts';
import { HashtagsScreen } from './pages/hashtags';
import { LoginStackScreen } from './pages/login';
import { SettingsScreen } from './pages/settings';
import { StatusStackScreen } from './pages/status';
import { Tabs } from './tabs';

import type { NavigatorScreenParams } from '@react-navigation/native';

type TimelineStackParams = {
  home: undefined;
  local: undefined;
  bubble: undefined;
  federated: undefined;
  list: { id: string };
  circle: { id: string };
  antenna: { id: string };
};
type NotificationsStackParams = {
  view: undefined;
};
type SearchStackParams = {
  search?: { type: 'statuses' | 'accounts' | 'hashtags' | 'links'; query: string };
};
type ProfileStackParams = {
  view: undefined;
};
type StatusStackParams = {
  view: { id: string };
  reblogs: { id: string };
  favourites: { id: string };
  dislikes: { id: string };
  quotes: { id: string };
};
type AccountStackParams = {
  view: { id: string };
};
type TabsParams = {
  timeline: NavigatorScreenParams<TimelineStackParams>;
  notifications: NavigatorScreenParams<NotificationsStackParams>;
  search: NavigatorScreenParams<SearchStackParams>;
  profile: NavigatorScreenParams<ProfileStackParams>;
  status: NavigatorScreenParams<StatusStackParams>;
};
type LoginStackParams = {
  instance: undefined;
  credentials: undefined;
  oauth_flow: undefined;
};
type RootStackParams = {
  login: undefined;
  app: NavigatorScreenParams<TabsParams>;
  settings: undefined;
  status: StatusStackParams;
  accounts: AccountStackParams;
  hashtags: { tag: string };
};

const RootStack = createNativeStackNavigator<RootStackParams>();

const RootNavigator = () => {
  const isLoggedIn = useAuthStore(({ currentAccount }) => !!currentAccount);

  return (
    <RootStack.Navigator>
      {isLoggedIn && (
        <>
          <RootStack.Screen name='app' component={Tabs} options={{ headerShown: false }} />
          <RootStack.Screen
            name='settings'
            component={SettingsScreen}
            options={{ header: Header, title: 'Settings' }}
          />
          <RootStack.Screen
            name='status'
            component={StatusStackScreen}
            options={{ headerShown: false }}
          />
          <RootStack.Screen
            name='accounts'
            component={AccountsStackScreen}
            options={{ headerShown: false }}
          />
          <RootStack.Screen
            name='hashtags'
            component={HashtagsScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
      <RootStack.Screen
        name='login'
        component={LoginStackScreen}
        options={{ headerShown: false, animationTypeForReplace: 'pop' }}
      />
    </RootStack.Navigator>
  );
};

export {
  type TimelineStackParams,
  type NotificationsStackParams,
  type SearchStackParams,
  type ProfileStackParams,
  type StatusStackParams,
  type AccountStackParams,
  type TabsParams,
  type LoginStackParams,
  type RootStackParams,
  RootNavigator,
};
