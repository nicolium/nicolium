import { type BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { HouseIcon, MagnifyingGlassIcon } from 'phosphor-react-native';
import { defineMessages, useIntl } from 'react-intl';
import { BottomNavigation } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeStackScreen } from './pages/home';
import { SearchStackScreen } from './pages/search';

import type { TabsParams } from './router';

const messages = defineMessages({
  home: { id: 'column.home', defaultMessage: 'Home' },
  search: { id: 'column.search', defaultMessage: 'Search' },
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
    </Tab.Navigator>
  );
};

export { Tabs };
