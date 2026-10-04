import { Avatar, BottomNavigation } from '@mkljczk/react-native-paper';
import { type BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable';
import { CommonActions } from '@react-navigation/native';
import {
  BellSimpleIcon,
  CaretUpDownIcon,
  HouseIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from 'phosphor-react-native';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { View } from 'react-native';
// import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { iconHelper } from '@/components/ui/icon';
import { useCredentialAccount } from '@/queries/accounts/use-account-credentials';

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

const PaperTabBar = ({ navigation, state, descriptors }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

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
    />
  );
};

// @ts-ignore
// if (Platform.OS === 'never_matches') {
//   const Tab = createNativeBottomTabNavigator<TabsParams>();

//   Tabs = () => {
//     const intl = useIntl();

//     return (
//       <Tab.Navigator
//         tabBar={(props) => <PaperTabBar {...props} />}
//         screenOptions={{ headerShown: false }}
//       >
//         <Tab.Screen
//           name='timeline'
//           component={HomeStackScreen}
//           options={{
//             tabBarLabel: intl.formatMessage(messages.home),
//             tabBarIcon: {
//               type: 'sfSymbol',
//               name: 'house',
//             },
//           }}
//         />
//         <Tab.Screen
//           name='search'
//           component={SearchStackScreen}
//           options={{
//             tabBarLabel: intl.formatMessage(messages.search),
//             tabBarIcon: {
//               type: 'sfSymbol',
//               name: 'magnifyingglass',
//             },
//           }}
//         />
//         <Tab.Screen
//           name='notifications'
//           component={NotificationsStackScreen}
//           options={{
//             tabBarLabel: intl.formatMessage(messages.notifications),
//             tabBarIcon: {
//               type: 'sfSymbol',
//               name: 'bell',
//             },
//           }}
//         />
//       </Tab.Navigator>
//     );
//   };
// } else {

const CurrentAccountAvatar: React.FC<{ color: string }> = ({ color }) => {
  const { data: currentAccount } = useCredentialAccount();

  const avatar = currentAccount ? (
    <Avatar.Image size={24} source={{ uri: currentAccount.avatar }} />
  ) : (
    <Avatar.Icon size={24} icon={iconHelper(UserIcon)} />
  );

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, paddingLeft: 18 }}>
      {avatar}
      <CaretUpDownIcon size={16} color={color} />
    </View>
  );
};

const Tab = createBottomTabNavigator<TabsParams>();

const Tabs = () => {
  const intl = useIntl();

  return (
    <Tab.Navigator
      tabBar={(props) => <PaperTabBar {...props} />}
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
        }}
      />
      <Tab.Screen
        name='profile'
        component={ProfileStackScreen}
        options={{
          tabBarLabel: intl.formatMessage(messages.profile),
          tabBarIcon: CurrentAccountAvatar,
        }}
      />
    </Tab.Navigator>
  );
};
// }

export { Tabs };
