import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';

import { useCredentialAccountId } from '@/queries/accounts/use-account-credentials';

import { Profile } from '../components/profile';

import type { ProfileStackParams } from '../router';

const ProfileScreen = (_: NativeStackScreenProps<ProfileStackParams, 'view'>) => {
  const { data: currentAccountId } = useCredentialAccountId();

  if (!currentAccountId) return null;

  return <Profile id={currentAccountId} ownAccount />;
};

const ProfileStack = createNativeStackNavigator<ProfileStackParams>();

const ProfileStackScreen = () => {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name='view'
        component={ProfileScreen}
        options={{ headerShown: false, title: 'Profile' }}
      />
    </ProfileStack.Navigator>
  );
};

export { ProfileStackScreen };
