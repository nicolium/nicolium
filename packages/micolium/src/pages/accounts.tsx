import { Appbar, Text, useTheme } from '@mkljczk/react-native-paper';
import {
  createNativeStackNavigator,
  type NativeStackHeaderProps,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { View } from 'react-native';

import { AccountsList } from '@/components/accounts/accounts-list';
import { StatusesList } from '@/components/statuses/statuses-list';
import { HeaderBackButton } from '@/components/ui/header-icon-button';
import { useFollowers, useFollowing, useSubscribers } from '@/queries/account-lists/use-follows';
import { useAccount } from '@/queries/accounts/use-account';
import { useCredentialAccountId } from '@/queries/accounts/use-account-credentials';
import { useFavourites } from '@/queries/status-lists/use-favourites';

import { Profile } from '@/components/accounts/profile';

import type { AccountStackParams } from '@/router/router';

const messages = defineMessages({
  followingHeader: { id: 'column.following', defaultMessage: 'Following' },
  followersHeader: { id: 'column.followers', defaultMessage: 'Followers' },
  subscribersHeader: { id: 'column.subscribers', defaultMessage: 'Subscribers' },
  favouritesHeader: { id: 'column.favourited_statuses', defaultMessage: 'Liked posts' },
});

const AccountsHeader = ({ navigation, route, back }: NativeStackHeaderProps) => {
  const intl = useIntl();
  const { colors } = useTheme();
  const { data: account } = useAccount(
    (route.params as AccountStackParams['view'] | undefined)?.id,
  );

  let title: string | Array<React.ReactNode>;
  let subtitle: string | undefined;
  switch (route.name) {
    case 'followers':
      title = intl.formatMessage(messages.followersHeader);
      subtitle = account ? `@${account.acct}` : undefined;
      break;
    case 'following':
      title = intl.formatMessage(messages.followingHeader);
      subtitle = account ? `@${account.acct}` : undefined;
      break;
    case 'subscribers':
      title = intl.formatMessage(messages.subscribersHeader);
      subtitle = account ? `@${account.acct}` : undefined;
      break;
    case 'favourites':
      title = intl.formatMessage(messages.favouritesHeader);
      subtitle = account ? `@${account.acct}` : undefined;
      break;
    default:
      title = '';
  }

  return (
    <Appbar.Header style={{ backgroundColor: colors.surfaceContainer }}>
      {back ? <HeaderBackButton onPress={navigation.goBack} /> : null}
      {subtitle ? (
        <View>
          <Text variant='titleMedium' numberOfLines={1}>
            {title}
          </Text>
          <Text style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{subtitle}</Text>
        </View>
      ) : (
        <Appbar.Content
          title={
            typeof title === 'string' ? (
              title
            ) : (
              <Text variant='titleLarge' numberOfLines={1}>
                {title}
              </Text>
            )
          }
        />
      )}
    </Appbar.Header>
  );
};

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
  const query = useFollowing(id);

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
  const query = useSubscribers(id);

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

const AccountFavouritesScreen = ({
  route: {
    params: { id },
  },
}: NativeStackScreenProps<AccountStackParams, 'favourites'>) => {
  const { data: currentAccountId } = useCredentialAccountId();

  const query = useFavourites(currentAccountId === id ? undefined : id);

  return (
    <StatusesList
      query={query}
      emptyMessageText={
        currentAccountId === id ? (
          <FormattedMessage
            id='empty_column.favourited_statuses'
            defaultMessage='You don’t have any liked posts yet. When you like one, it will show up here.'
          />
        ) : (
          <FormattedMessage
            id='empty_column.account_favourited_statuses'
            defaultMessage='This user doesn’t have any liked posts yet.'
          />
        )
      }
    />
  );
};

const AccountsStack = createNativeStackNavigator<AccountStackParams>();

const AccountsStackScreen = () => {
  return (
    <AccountsStack.Navigator screenOptions={{ header: AccountsHeader }}>
      <AccountsStack.Screen
        name='view'
        component={AccountScreen}
        options={{ headerShown: false }}
      />
      <AccountsStack.Screen name='followers' component={AccountFollowersScreen} />
      <AccountsStack.Screen name='following' component={AccountFollowingScreen} />
      <AccountsStack.Screen name='subscribers' component={AccountSubscribersScreen} />
      <AccountsStack.Screen name='favourites' component={AccountFavouritesScreen} />
    </AccountsStack.Navigator>
  );
};

export { AccountsStackScreen };
