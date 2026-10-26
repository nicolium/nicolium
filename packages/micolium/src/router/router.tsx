import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { AccountsStackScreen } from '@/pages/accounts';
import { BookmarksStackScreen } from '@/pages/bookmarks';
import { ConversationsStackScreen } from '@/pages/conversations';
import { HashtagsScreen } from '@/pages/hashtags';
import { LinksScreen } from '@/pages/links';
import { LoginStackScreen } from '@/pages/login';
import { SettingsStackScreen } from '@/pages/settings';
import { StatusStackScreen } from '@/pages/statuses';
import { useAuthStore } from '@/stores/auth';

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
  content: undefined;
  follow_requests: undefined;
  blocks: undefined;
  mutes: undefined;
  muted_threads: undefined;
  followed_tags: undefined;
  filters: undefined;
  filter: { id?: string };
  interaction_policies: undefined;
};
type StatusStackParams = {
  view: { id: string };
  reblogs: { id: string };
  favourites: { id: string };
  dislikes: { id: string };
  reactions: { id: string; emoji?: string };
  quotes: { id: string };
  mentions: { id: string };
  history: { id: string };
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
type ConversationsStackParams = {
  index: undefined;
  mentions: { id: string };
};
type TabsParams = {
  timeline: NavigatorScreenParams<TimelineStackParams>;
  notifications: NavigatorScreenParams<NotificationsStackParams>;
  search: NavigatorScreenParams<SearchStackParams>;
  profile: NavigatorScreenParams<ProfileStackParams>;
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
  links: { url: string };
  conversations: NavigatorScreenParams<ConversationsStackParams>;
};

const RootStack = createNativeStackNavigator<RootStackParams>();

const RootNavigator = () => {
  const isLoggedIn = useAuthStore(({ currentAccount }) => !!currentAccount);

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn && (
        <>
          <RootStack.Screen name='app' component={Tabs} />
          <RootStack.Screen name='settings' component={SettingsStackScreen} />
          <RootStack.Screen
            name='status'
            component={StatusStackScreen}
            getId={({ params }) => params?.params?.id}
          />
          <RootStack.Screen
            name='accounts'
            component={AccountsStackScreen}
            getId={({ params }) => params?.params?.id}
          />
          <RootStack.Screen
            name='hashtags'
            component={HashtagsScreen}
            getId={({ params }) => params.tag}
          />
          <RootStack.Screen name='bookmarks' component={BookmarksStackScreen} />
          <RootStack.Screen
            name='links'
            component={LinksScreen}
            getId={({ params }) => params.url}
          />
          <RootStack.Screen name='conversations' component={ConversationsStackScreen} />
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
  type ConversationsStackParams,
  type TabsParams,
  type LoginStackParams,
  type RootStackParams,
  RootNavigator,
};
