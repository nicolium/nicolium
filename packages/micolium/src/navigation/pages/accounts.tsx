import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { AccountsList } from '@/components/accounts/accounts-list';
import { useFollowers } from '@/queries/account-lists/use-follows';

import { Profile } from '../components/profile';

import type { AccountStackParams } from '../router';

const AccountScreen = ({ route }: NativeStackScreenProps<AccountStackParams, 'view'>) => {
  return <Profile id={route.params?.id} />;
};

const AccountFollowersScreen = ({
  route: {
    params: { id },
  },
}: NativeStackScreenProps<AccountStackParams, 'followers'>) => {
  const query = useFollowers(id);

  return (
    <AccountsList
      query={query}
      emptyMessageText={
        <FormattedMessage
          id='account.followers.empty'
          defaultMessage='No one follows this user yet.'
        />
      }
    />
  );
};

const AccountFollowingScreen = ({
  route: {
    params: { id },
  },
}: NativeStackScreenProps<AccountStackParams, 'following'>) => {
  const query = useFollowers(id);

  return (
    <AccountsList
      query={query}
      emptyMessageText={
        <FormattedMessage
          id='account.follows.empty'
          defaultMessage='This user doesn’t follow anyone yet.'
        />
      }
    />
  );
};

const AccountSubscribersScreen = ({
  route: {
    params: { id },
  },
}: NativeStackScreenProps<AccountStackParams, 'subscribers'>) => {
  const query = useFollowers(id);

  return (
    <AccountsList
      query={query}
      emptyMessageText={
        <FormattedMessage
          id='account.subscribers.empty'
          defaultMessage='No one subscribes to this user yet.'
        />
      }
    />
  );
};

const AccountsStack = createNativeStackNavigator<AccountStackParams>();

const AccountsStackScreen = () => {
  return (
    <AccountsStack.Navigator>
      <AccountsStack.Screen
        name='view'
        component={AccountScreen}
        options={{ headerShown: false }}
      />
      <AccountsStack.Screen name='followers' component={AccountFollowersScreen} />
      <AccountsStack.Screen name='following' component={AccountFollowingScreen} />
      <AccountsStack.Screen name='subscribers' component={AccountSubscribersScreen} />
    </AccountsStack.Navigator>
  );
};

export { AccountsStackScreen };
