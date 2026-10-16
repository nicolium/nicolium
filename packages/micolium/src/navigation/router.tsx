import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useAuthStore } from '@/stores/auth';

import { AccountsStackScreen } from './pages/accounts';
import { BookmarksStackScreen } from './pages/bookmarks';
import { FollowRequestsScreen } from './pages/follow-requests';
import { HashtagsScreen } from './pages/hashtags';
import { LoginStackScreen } from './pages/login';
import { SettingsStackScreen } from './pages/settings';
import { StatusStackScreen } from './pages/status';
import { Tabs } from './tabs';

import type { NavigatorScreenParams } from '@react-navigation/native';

type RootStackType = typeof RootStack;

declare module '@react-navigation/native' {
  interface RootNavigator extends RootStackType {}
}

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
  view: { tab: 'all' | 'mentions' };
};
type SearchStackParams = {
  search?: { type: 'statuses' | 'accounts' | 'hashtags' | 'links'; query: string };
};
type ProfileStackParams = {
  view: undefined;
};
type SettingsStackParams = {
  index: undefined;
  compose: undefined;
  timelines: undefined;
  notifications: undefined;
  appearance: undefined;
};
type StatusStackParams = {
  view: { id: string };
  reblogs: { id: string };
  favourites: { id: string };
  dislikes: { id: string };
  quotes: { id: string };
  mentions: { id: string };
};
type AccountStackParams = {
  view: { id: string };
  followers: { id: string };
  following: { id: string };
  subscribers: { id: string };
  favourites: { id: string };
};
type BookmarksStackParams = {
  all: undefined;
  folder: { id: string };
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
  settings: NavigatorScreenParams<SettingsStackParams>;
  status: NavigatorScreenParams<StatusStackParams>;
  accounts: NavigatorScreenParams<AccountStackParams>;
  hashtags: { tag: string };
  bookmarks: NavigatorScreenParams<BookmarksStackParams>;
  follow_requests: undefined;
};

const messages = defineMessages({
  followRequests: { id: 'column.follow_requests', defaultMessage: 'Follow requests' },
});

const RootStack = createNativeStackNavigator<RootStackParams>();

const RootNavigator = () => {
  const intl = useIntl();
  const isLoggedIn = useAuthStore(({ currentAccount }) => !!currentAccount);

  return (
    <RootStack.Navigator screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      {isLoggedIn && (
        <>
          <RootStack.Screen name='app' component={Tabs} options={{ headerShown: false }} />
          <RootStack.Screen
            name='settings'
            component={SettingsStackScreen}
            options={{ headerShown: false }}
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
          <RootStack.Screen
            name='bookmarks'
            component={BookmarksStackScreen}
            options={{ headerShown: false }}
          />
          <RootStack.Screen
            name='follow_requests'
            component={FollowRequestsScreen}
            options={{ title: intl.formatMessage(messages.followRequests) }}
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
  type SettingsStackParams,
  type StatusStackParams,
  type AccountStackParams,
  type BookmarksStackParams,
  type TabsParams,
  type LoginStackParams,
  type RootStackParams,
  RootNavigator,
};
