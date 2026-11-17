import {
  createNativeStackNavigator,
  createNativeStackScreen,
} from '@react-navigation/native-stack';

import { AccountsStackScreen } from '@/pages/accounts';
import { BookmarksStackScreen } from '@/pages/bookmarks';
import { ConversationsStackScreen } from '@/pages/conversations';
import { HashtagsScreen } from '@/pages/hashtags';
import { LinksScreen } from '@/pages/links';
import { LoginStackScreen } from '@/pages/login';
import { SettingsStackScreen } from '@/pages/settings';
import { StatusStackScreen } from '@/pages/statuses';
import { useAuthStore } from '@/stores/auth';

import { Tabs, TabScreenLayout } from './tabs';

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
  wrenched: undefined;
  list: { id: string };
  circle: { id: string };
  antenna: { id: string };
};
type NotificationsTabsParams = {
  all: undefined;
  mentions: undefined;
};
type NotificationsStackParams = {
  view: NavigatorScreenParams<NotificationsTabsParams> | undefined;
  requests: undefined;
  request: { id: string };
  policy: undefined;
};
type ChatsStackParams = {
  all: undefined;
  chat: { id: string };
};
type ProfileStackParams = {
  view: undefined;
};
type SettingsStackParams = {
  index: undefined;
  compose: undefined;
  timelines: undefined;
  content: undefined;
  notifications: undefined;
  appearance: undefined;
  content_filtering: undefined;
  follow_requests: undefined;
  blocks: undefined;
  mutes: undefined;
  domain_blocks: undefined;
  muted_threads: undefined;
  followed_tags: undefined;
  filters: undefined;
  filter: { id?: string };
  interaction_policies: undefined;
  scheduled_statuses: undefined;
  edit_profile: undefined;
  about: undefined;
  interaction_requests: undefined;
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
  search: { query: string } | undefined;
  chats: NavigatorScreenParams<ChatsStackParams>;
  profile: NavigatorScreenParams<ProfileStackParams>;
};
type LoginStackParams = {
  instance: undefined;
  credentials: undefined;
  otp: { mfaToken: string };
  oauth_flow: undefined;
};

const useIsLoggedIn = () => useAuthStore(({ currentAccount }) => !!currentAccount);
const useNotIsLoggedIn = () => !useIsLoggedIn();

const RootStack = createNativeStackNavigator({
  screenOptions: { headerShown: false },
  groups: {
    loggedIn: {
      if: useIsLoggedIn,
      screens: {
        app: Tabs,
        settings: createNativeStackScreen({
          screen: SettingsStackScreen,
          layout: TabScreenLayout,
        }),
        status: createNativeStackScreen({
          screen: StatusStackScreen,
          getId: ({ params }) => params?.params?.id,
          layout: TabScreenLayout,
        }),
        accounts: createNativeStackScreen({
          screen: AccountsStackScreen,
          getId: ({ params }) => params?.params?.id,
          layout: TabScreenLayout,
        }),
        hashtags: createNativeStackScreen({
          screen: HashtagsScreen,
          getId: ({ params }) => params.tag,
          layout: TabScreenLayout,
        }),
        bookmarks: createNativeStackScreen({
          screen: BookmarksStackScreen,
          layout: TabScreenLayout,
        }),
        links: createNativeStackScreen({
          screen: LinksScreen,
          getId: ({ params }) => params.url,
          layout: TabScreenLayout,
        }),
        conversations: createNativeStackScreen({
          screen: ConversationsStackScreen,
          layout: TabScreenLayout,
        }),
        login: createNativeStackScreen({
          screen: LoginStackScreen,
        }),
      },
    },
    auth: {
      if: useNotIsLoggedIn,
      screens: {
        login: createNativeStackScreen({
          screen: LoginStackScreen,
          options: { animationTypeForReplace: 'pop' },
        }),
      },
    },
  },
});

const RootNavigator = RootStack.getComponent();

export {
  type TimelineStackParams,
  type NotificationsTabsParams,
  type NotificationsStackParams,
  type ChatsStackParams,
  type ProfileStackParams,
  type SettingsStackParams,
  type StatusStackParams,
  type AccountStackParams,
  type BookmarksStackParams,
  type ConversationsStackParams,
  type TabsParams,
  type LoginStackParams,
  RootNavigator,
};
