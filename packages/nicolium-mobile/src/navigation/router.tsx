import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuthStore } from '@/stores/auth';

import { Header } from '../components/ui/header';

import { LoginScreen } from './pages/login';
import { SettingsScreen } from './pages/settings';
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
type SearchStackParams = {
  search?: { type: 'statuses' | 'accounts' | 'hashtags' | 'links'; query: string };
};
type TabsParams = {
  timeline: NavigatorScreenParams<TimelineStackParams>;
  search: NavigatorScreenParams<SearchStackParams>;
};
type RootStackParams = {
  login: undefined;
  app: NavigatorScreenParams<TabsParams>;
  settings: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParams>();

const RootNavigator = () => {
  const { client } = useAuthStore();

  return (
    <RootStack.Navigator>
      {client ? (
        <>
          <RootStack.Screen name='app' component={Tabs} options={{ headerShown: false }} />
          <RootStack.Screen
            name='settings'
            component={SettingsScreen}
            options={{ header: Header, title: 'Settings' }}
          />
        </>
      ) : (
        <RootStack.Screen
          name='login'
          component={LoginScreen}
          options={{ headerShown: false, animationTypeForReplace: 'pop' }}
        />
      )}
    </RootStack.Navigator>
  );
};

export {
  type TimelineStackParams,
  type SearchStackParams,
  type TabsParams,
  type RootStackParams,
  RootNavigator,
};
