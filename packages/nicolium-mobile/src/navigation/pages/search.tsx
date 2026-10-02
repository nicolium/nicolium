import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { debounce } from '@tanstack/react-pacer/debouncer';
import React, { useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { ActivityIndicator, Divider, Searchbar, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { TabsProvider, Tabs, TabScreen } from 'react-native-paper-tabs';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Account } from '@/components/account';
import { Status } from '@/components/status';
import { useSearchAccounts, useSearchStatuses } from '@/queries/search/use-search';

import type { SearchStackParams } from '../router';

const SEARCH_TYPES = ['accounts', 'statuses', 'hashtags'] as const;

const SearchScreen = ({
  route,
  navigation,
}: NativeStackScreenProps<SearchStackParams, 'search'>) => {
  const { top: topInset } = useSafeAreaInsets();
  const { colors } = useTheme();

  const { type: activeType = 'accounts', query: activeQuery = '' } = route.params || {};

  const [enteredQuery, setEnteredQuery] = React.useState(activeQuery || '');

  const debouncedNavigate = useCallback(
    debounce(
      (query: string) => {
        navigation.setParams({ query: query });
      },
      { wait: 900 },
    ),
    [],
  );

  const handleChangeIndex = (index: number) => navigation.setParams({ type: SEARCH_TYPES[index] });

  const setQuery = (query: string) => {
    setEnteredQuery(query);
    debouncedNavigate(query);
  };

  const accountsQuery = useSearchAccounts((activeType === 'accounts' && activeQuery) || '');
  const statusesQuery = useSearchStatuses((activeType === 'statuses' && activeQuery) || '');

  return (
    <>
      <Searchbar
        style={{ marginHorizontal: 16, marginBottom: 8, marginTop: 8 + topInset }}
        placeholder='Search the Fediverse'
        value={enteredQuery}
        onChangeText={setQuery}
      />
      <TabsProvider
        defaultIndex={SEARCH_TYPES.indexOf(route.params?.type || 'accounts')}
        onChangeIndex={handleChangeIndex}
      >
        <Tabs style={{ backgroundColor: colors.background }} uppercase={false}>
          <TabScreen label='Accounts'>
            <FlashList
              data={accountsQuery.data}
              renderItem={({ item }) => (
                <TouchableRipple onPress={() => {}} key={item} style={{ paddingVertical: 8, paddingHorizontal: 12 }}>
                  <Account.FromServer key={item} id={item} />
                </TouchableRipple>
              )}
              ItemSeparatorComponent={Divider}
              onEndReached={
                accountsQuery.hasNextPage && !accountsQuery.isFetching
                  ? accountsQuery.fetchNextPage
                  : undefined
              }
              onEndReachedThreshold={0.1}
              ListFooterComponent={
                accountsQuery.isFetching ? (
                  <ActivityIndicator style={{ marginVertical: 8 }} />
                ) : undefined
              }
            />
          </TabScreen>
          <TabScreen label='Posts'>
            <FlashList
              data={statusesQuery.data}
              renderItem={({ item }) => (
                <TouchableRipple onPress={() => {}} key={item} style={{ paddingVertical: 16, paddingHorizontal: 12 }}>
                  <Status.FromServer id={item} />
                </TouchableRipple>
              )}
              ItemSeparatorComponent={Divider}
              onEndReached={
                statusesQuery.hasNextPage && !statusesQuery.isFetching
                  ? statusesQuery.fetchNextPage
                  : undefined
              }
              onEndReachedThreshold={0.1}
              ListFooterComponent={
                statusesQuery.isFetching ? (
                  <ActivityIndicator style={{ marginVertical: 8 }} />
                ) : undefined
              }
            />
          </TabScreen>
          <TabScreen label='Hashtags'>
            <Text>meow3</Text>
          </TabScreen>
        </Tabs>
      </TabsProvider>
    </>
  );
};

const SearchStack = createNativeStackNavigator<SearchStackParams>();

const SearchStackScreen = () => {
  return (
    <SearchStack.Navigator>
      <SearchStack.Screen name='search' component={SearchScreen} options={{ headerShown: false }} />
    </SearchStack.Navigator>
  );
};

export { SearchStackScreen };
