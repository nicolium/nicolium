import { BottomNavigation } from '@mkljczk/react-native-paper';
import {
  type BottomTabBarProps,
  type BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {
  createNativeBottomTabNavigator,
  type NativeBottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs/unstable';
import { CommonActions, type ScreenLayoutArgs } from '@react-navigation/native';
import {
  BellSimpleIcon,
  CaretUpDownIcon,
  HouseIcon,
  MagnifyingGlassIcon,
} from 'phosphor-react-native';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Platform, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { CurrentAccountAvatar } from '@/components/current-account-avatar';
import { useNotificationsUnreadCount } from '@/queries/notifications/use-notifications';
import { useUiStoreActions } from '@/stores/ui';

import { HomeStackScreen } from './pages/home';
import { NotificationsStackScreen } from './pages/notifications';
import { ProfileStackScreen } from './pages/profile';
import { SearchStackScreen } from './pages/search';

import type { TabsParams } from './router';

const messages = defineMessages({
  home: { id: 'column.home', defaultMessage: 'Home' },
  notifications: { id: 'column.notifications', defaultMessage: 'Notifications' },
  search: { id: 'column.search', defaultMessage: 'Search' },
  profile: { id: 'column.profile', defaultMessage: 'Profile' },
});

const TabScreenLayout: (
  props: ScreenLayoutArgs<
    TabsParams,
    keyof TabsParams,
    NativeBottomTabNavigationOptions | BottomTabNavigationOptions,
    any
  >,
) => React.ReactElement = ({ children }) => <SafeAreaProvider>{children}</SafeAreaProvider>;

let Tabs;

// @ts-ignore
if (Platform.OS === 'ios') {
  const Tab = createNativeBottomTabNavigator<TabsParams>();

  Tabs = () => {
    const intl = useIntl();
    const unreadCount = useNotificationsUnreadCount();
    const { openAccountSwitcher } = useUiStoreActions();

    return (
      <Tab.Navigator
        screenLayout={TabScreenLayout}
        screenOptions={{
          headerShown: false,
          overrideScrollViewContentInsetAdjustmentBehavior: false,
        }}
      >
        <Tab.Screen
          name='timeline'
          component={HomeStackScreen}
          options={{
            tabBarLabel: intl.formatMessage(messages.home),
            tabBarIcon: {
              type: 'sfSymbol',
              name: 'house.fill',
            },
          }}
        />
        <Tab.Screen
          name='search'
          component={SearchStackScreen}
          options={{
            tabBarLabel: intl.formatMessage(messages.search),
            tabBarIcon: {
              type: 'sfSymbol',
              name: 'magnifyingglass',
            },
          }}
        />
        <Tab.Screen
          name='notifications'
          component={NotificationsStackScreen}
          options={{
            tabBarLabel: intl.formatMessage(messages.notifications),
            tabBarIcon: {
              type: 'sfSymbol',
              name: 'bell.fill',
            },
            tabBarBadge: unreadCount || undefined,
          }}
        />
        <Tab.Screen
          name='profile'
          component={ProfileStackScreen}
          options={{
            tabBarLabel: intl.formatMessage(messages.profile),
            tabBarIcon: {
              type: 'sfSymbol',
              name: 'person.fill',
            },
          }}
          listeners={({ navigation, route }) => ({
            tabPress: (e) => {
              if (!e.data.behavior.popToTop) return;

              const stackState = navigation
                .getState()
                .routes.find(({ key }) => key === route.key)?.state;

              if (!stackState?.index) openAccountSwitcher();
            },
          })}
        />
      </Tab.Navigator>
    );
  };
} else {
  const TabBar = ({ navigation, state, descriptors }: BottomTabBarProps) => {
    const insets = useSafeAreaInsets();
    const { openAccountSwitcher } = useUiStoreActions();

    return (
      <BottomNavigation.Bar
        navigationState={state}
        safeAreaInsets={insets}
        onTabPress={({ route, preventDefault }) => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (event.defaultPrevented) {
            preventDefault();
          } else {
            navigation.dispatch({
              ...CommonActions.navigate(route.name, route.params),
              target: state.key,
            });
          }
        }}
        onTabLongPress={({ route }) => {
          if (route.name !== 'profile') return;

          return openAccountSwitcher();
        }}
        renderIcon={({ route, focused, color }) =>
          descriptors[route.key].options.tabBarIcon?.({
            focused,
            color: color.toString(),
            size: 24,
          }) ?? null
        }
        getLabelText={({ route }) => {
          const { options } = descriptors[route.key];
          return typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : typeof options.title === 'string'
              ? options.title
              : route.name;
        }}
        getBadge={({ route }) => descriptors[route.key].options.tabBarBadge}
      />
    );
  };

  const ProfileIcon: React.FC<{ color: string }> = ({ color }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, paddingLeft: 18 }}>
      <CurrentAccountAvatar />
      <CaretUpDownIcon size={16} color={color} />
    </View>
  );

  const Tab = createBottomTabNavigator<TabsParams>();

  Tabs = () => {
    const intl = useIntl();
    const unreadCount = useNotificationsUnreadCount();

    return (
      <Tab.Navigator
        tabBar={(props) => <TabBar {...props} />}
        screenLayout={TabScreenLayout}
        screenOptions={{ headerShown: false, animation: 'shift' }}
      >
        <Tab.Screen
          name='timeline'
          component={HomeStackScreen}
          options={{
            tabBarLabel: intl.formatMessage(messages.home),
            tabBarIcon: ({ color, focused }) => (
              <HouseIcon color={color} weight={focused ? 'fill' : undefined} />
            ),
          }}
        />
        <Tab.Screen
          name='search'
          component={SearchStackScreen}
          options={{
            tabBarLabel: intl.formatMessage(messages.search),
            tabBarIcon: ({ color, focused }) => (
              <MagnifyingGlassIcon color={color} weight={focused ? 'fill' : undefined} />
            ),
          }}
        />
        <Tab.Screen
          name='notifications'
          component={NotificationsStackScreen}
          options={{
            tabBarLabel: intl.formatMessage(messages.notifications),
            tabBarIcon: ({ color, focused }) => (
              <BellSimpleIcon color={color} weight={focused ? 'fill' : undefined} />
            ),
            tabBarBadge: unreadCount || undefined,
          }}
        />
        <Tab.Screen
          name='profile'
          component={ProfileStackScreen}
          options={{
            tabBarLabel: intl.formatMessage(messages.profile),
            tabBarIcon: ProfileIcon,
          }}
        />
      </Tab.Navigator>
    );
  };
}

export { Tabs };
