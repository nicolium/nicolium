import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';

import { Profile } from '../components/profile';

import type { AccountStackParams } from '../router';

const AccountScreen = ({ route }: NativeStackScreenProps<AccountStackParams, 'view'>) => {
  return <Profile id={route.params.id} />;
};

const AccountsStack = createNativeStackNavigator<AccountStackParams>();

const AccountsStackScreen = () => {
  return (
    <AccountsStack.Navigator>
      <AccountsStack.Screen
        name='view'
        component={AccountScreen}
        options={{ headerShown: false, title: 'Profile' }}
      />
    </AccountsStack.Navigator>
  );
};

export { AccountsStackScreen };
