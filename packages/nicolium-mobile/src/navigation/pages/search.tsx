import { ActivityIndicator, Divider, Searchbar, Text, useTheme } from '@mkljczk/react-native-paper';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { debounce } from '@tanstack/react-pacer/debouncer';
import React, { useCallback, useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { View } from 'react-native';
import { TabsProvider, Tabs, TabScreen } from 'react-native-paper-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Account } from '@/components/accounts/account';
import { Status } from '@/components/statuses/status';
import { EmptyMessage } from '@/components/ui/empty-message';
import { useSearchAccounts, useSearchStatuses } from '@/queries/search/use-search';
import { useSuggestedAccounts } from '@/queries/trends/use-suggested-accounts';
import { useTrendingStatuses } from '@/queries/trends/use-trending-statuses';
import { useFeatures } from '@/stores/auth';

import type { SearchStackParams } from '../router';

const messages = defineMessages({
  accounts: { id: 'search_results.accounts', defaultMessage: 'People' },
  statuses: { id: 'search_results.statuses', defaultMessage: 'Posts' },
  hashtags: { id: 'search_results.hashtags', defaultMessage: 'Hashtags' },
  links: { id: 'search_results.links', defaultMessage: 'News' },
});

const SEARCH_TYPES = ['accounts', 'statuses', 'hashtags', 'links'] as const;

const SearchScreen = ({
  route,
  navigation,
}: NativeStackScreenProps<SearchStackParams, 'search'>) => {
  const intl = useIntl();
  const { top: topInset } = useSafeAreaInsets();
  const { colors } = useTheme();
  const features = useFeatures();
  const [forcedRerenderKey, setForcedRerenderKey] = useState(0);

  const { type: activeType = 'accounts', query: activeQuery = '' } = route.params || {};

  const [enteredQuery, setEnteredQuery] = React.useState(activeQuery || '');

  const hasQuery = activeQuery.trim().length > 0;

  useEffect(() => {
    if (activeType === 'links' && hasQuery) {
      navigation.setParams({ type: 'accounts' });
      setForcedRerenderKey((value) => value + 1);
    }
  }, [activeType, activeQuery]);

  const debouncedNavigate = useCallback(
    debounce(
      (query: string) => {
        navigation.setParams({ query: query });
      },
      { wait: 400 },
    ),
    [],
  );

  const handleChangeIndex = (index: number) => navigation.setParams({ type: SEARCH_TYPES[index] });

  const setQuery = (query: string) => {
    setEnteredQuery(query);
    debouncedNavigate(query);
  };

  const accountsQuery = useSearchAccounts((activeType === 'accounts' && activeQuery.trim()) || '');
  const statusesQuery = useSearchStatuses((activeType === 'statuses' && activeQuery.trim()) || '');
  const trendingAccountsQuery = useSuggestedAccounts(activeType === 'accounts' && !hasQuery);
  const trendingStatusesQuery = useTrendingStatuses(activeType === 'statuses' && !hasQuery);

  return (
    <>
      <View
        style={{
          backgroundColor: colors.surfaceContainer,
          paddingBottom: 8,
          paddingTop: 8 + topInset,
        }}
      >
        <Searchbar
          placeholder='Search the Fediverse'
          value={enteredQuery}
          onChangeText={setQuery}
        />
      </View>
      <TabsProvider
        defaultIndex={SEARCH_TYPES.indexOf(route.params?.type || 'accounts')}
        onChangeIndex={handleChangeIndex}
        key={forcedRerenderKey}
      >
        <Tabs style={{ backgroundColor: colors.surfaceContainer }} uppercase={false}>
          <TabScreen label={intl.formatMessage(messages.accounts)}>
            <FlashList
              data={
                hasQuery
                  ? accountsQuery.data
                  : trendingAccountsQuery.data?.map(({ account_id: id }) => id)
              }
              renderItem={({ item }) => (
                <Account
                  key={item}
                  id={item}
                  style={{ paddingVertical: 8, padding: 12 }}
                  withLink
                />
              )}
              ItemSeparatorComponent={Divider}
              onEndReached={
                hasQuery && accountsQuery.hasNextPage && !accountsQuery.isFetching
                  ? accountsQuery.fetchNextPage
                  : undefined
              }
              onEndReachedThreshold={0.1}

              ListEmptyComponent={
                !accountsQuery.isPending ? (
                  <EmptyMessage
                    emptyMessageText={
                      <FormattedMessage
                        id='empty_column.search.accounts'
                        defaultMessage='There are no people results for "{term}"'
                        values={{ term: activeQuery }}
                      />
                    }
                  />
                ) : null
              }
              ListFooterComponent={
                accountsQuery.isFetching ? (
                  <ActivityIndicator style={{ marginVertical: 8 }} />
                ) : undefined
              }
            />
          </TabScreen>
          <TabScreen label={intl.formatMessage(messages.statuses)}>
            <FlashList
              data={(hasQuery ? statusesQuery : trendingStatusesQuery).data}
              renderItem={({ item }) => <Status id={item} withLink />}
              ItemSeparatorComponent={Divider}
              onEndReached={
                hasQuery && statusesQuery.hasNextPage && !statusesQuery.isFetching
                  ? statusesQuery.fetchNextPage
                  : undefined
              }
              onEndReachedThreshold={0.1}
              ListEmptyComponent={
                !statusesQuery.isPending ? (
                  <EmptyMessage
                    emptyMessageText={
                      <FormattedMessage
                        id='empty_column.search.statuses'
                        defaultMessage='There are no posts results for "{term}"'
                        values={{ term: activeQuery }}
                      />
                    }
                  />
                ) : null
              }
              ListFooterComponent={
                statusesQuery.isFetching ? (
                  <ActivityIndicator style={{ marginVertical: 8 }} />
                ) : undefined
              }
            />
          </TabScreen>
          <TabScreen label={intl.formatMessage(messages.hashtags)}>
            <Text>Hashtags</Text>
          </TabScreen>
          {features.trendingLinks && !hasQuery && (
            <TabScreen label={intl.formatMessage(messages.links)}>
              <Text>Links</Text>
            </TabScreen>
          )}
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
