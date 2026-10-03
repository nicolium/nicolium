import { Text, useTheme } from '@mkljczk/react-native-paper';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { Tabs, TabScreen, TabsProvider } from 'react-native-paper-tabs';

import { Header } from '@/components/ui/header';

import type { NotificationsStackParams } from '../router';

const NotificationsScreen = (_props: NativeStackScreenProps<NotificationsStackParams, 'view'>) => {
  const { colors } = useTheme();
  // const { data: notifications } = useNotifications();

  return (
    <TabsProvider defaultIndex={0}>
      <Tabs style={{ backgroundColor: colors.background }} uppercase={false}>
        <TabScreen label='All'>
          <Text>meow</Text>
        </TabScreen>
        <TabScreen label='Mentions'>
          <Text>meow2</Text>
        </TabScreen>
      </Tabs>
    </TabsProvider>
  );
};

const NotificationsStack = createNativeStackNavigator<NotificationsStackParams>();

const NotificationsStackScreen = () => {
  return (
    <NotificationsStack.Navigator>
      <NotificationsStack.Screen
        name='view'
        component={NotificationsScreen}
        options={{ header: Header, title: 'Notifications' }}
      />
    </NotificationsStack.Navigator>
  );
};

export { NotificationsStackScreen };
