import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import React from 'react';

import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { useCredentialAccountId } from '@/queries/accounts/use-account-credentials';

import { Profile } from '../components/profile';

import type { ProfileStackParams } from '../router';

const ProfileScreen = (_: NativeStackScreenProps<ProfileStackParams, 'view'>) => {
  const { data: currentAccountId } = useCredentialAccountId();

  if (!currentAccountId) return <LoadingIndicator />;

  return <Profile id={currentAccountId} ownAccount />;
};

const ProfileStack = createNativeStackNavigator<ProfileStackParams>();

const ProfileStackScreen = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen name='view' component={ProfileScreen} options={{ headerShown: false }} />
  </ProfileStack.Navigator>
);

export { ProfileStackScreen };
