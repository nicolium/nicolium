import {
  ActivityIndicator,
  Carousel,
  CarouselItem,
  Divider,
  Searchbar,
  useTheme,
} from '@mkljczk/react-native-paper';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { debounce } from '@tanstack/react-pacer/debouncer';
import React, { useCallback, useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { View } from 'react-native';
import { TabsProvider, Tabs, TabScreen } from 'react-native-paper-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Account } from '@/components/accounts/account';
import { Hashtag } from '@/components/hashtag';
import { Status } from '@/components/statuses/status';
import { TrendsLink } from '@/components/trends-link';
import { EmptyMessage } from '@/components/ui/empty-message';
import { LoadMore } from '@/components/ui/load-more';
import { useFeatures } from '@/contexts/current-account-context';
import {
  useSearchAccounts,
  useSearchHashtags,
  useSearchStatuses,
} from '@/queries/search/use-search';
import { useSuggestedAccounts } from '@/queries/trends/use-suggested-accounts';
import { useTrendingLinks } from '@/queries/trends/use-trending-links';
import { useTrendingStatuses } from '@/queries/trends/use-trending-statuses';
import useTrendingTags from '@/queries/trends/use-trending-tags';
import { useSetting } from '@/stores/settings';

import type { SearchStackParams } from '../router';

const messages = defineMessages({
  accounts: { id: 'search_results.accounts', defaultMessage: 'People' },
  statuses: { id: 'search_results.statuses', defaultMessage: 'Posts' },
  hashtags: { id: 'search_results.hashtags', defaultMessage: 'Hashtags' },
  links: { id: 'search_results.links', defaultMessage: 'News' },
});

const SEARCH_TYPES = ['accounts', 'statuses', 'hashtags', 'links'] as const;

const LoadingIndicator = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size='large' />
  </View>
);

const SearchScreen = ({
  route,
  navigation,
}: NativeStackScreenProps<SearchStackParams, 'search'>) => {
  const intl = useIntl();
  const { top: topInset } = useSafeAreaInsets();
  const { colors } = useTheme();
  const features = useFeatures();
  const autoloadMore = useSetting('timelines.autoloadMore');

  const { type: activeType = 'accounts', query: activeQuery = '' } = route.params || {};

  const [forcedRerenderKey, setForcedRerenderKey] = React.useState(0);
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
  const hashtagsQuery = useSearchHashtags((activeType === 'hashtags' && activeQuery.trim()) || '');
  const trendingAccountsQuery = useSuggestedAccounts(activeType === 'accounts' && !hasQuery);
  const trendingStatusesQuery = useTrendingStatuses(activeType === 'statuses' && !hasQuery);
  const trendingHashtagsQuery = useTrendingTags(activeType === 'hashtags' && !hasQuery);
  const trendingLinksQuery = useTrendingLinks(activeType === 'links' && !hasQuery);

  const activeAccountsQuery = hasQuery ? accountsQuery : trendingAccountsQuery;
  const activeStatusesQuery = hasQuery ? statusesQuery : trendingStatusesQuery;
  const activeHashtagsQuery = hasQuery ? hashtagsQuery : trendingHashtagsQuery;

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
            {activeAccountsQuery.isPending && activeAccountsQuery.isEnabled ? (
              <LoadingIndicator />
            ) : (
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
                    withFollowButton
                  />
                )}
                ItemSeparatorComponent={Divider}
                onEndReached={
                  autoloadMore && hasQuery && accountsQuery.hasNextPage && !accountsQuery.isFetching
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
                ListFooterComponent={<LoadMore query={accountsQuery} />}
                onRefresh={activeAccountsQuery.refetch}
                refreshing={activeAccountsQuery.isRefetching}
              />
            )}
          </TabScreen>
          <TabScreen label={intl.formatMessage(messages.statuses)}>
            {activeStatusesQuery.isEnabled && activeStatusesQuery.isPending ? (
              <LoadingIndicator />
            ) : (
              <FlashList
                data={activeStatusesQuery.data}
                renderItem={({ item }) => <Status id={item} withLink />}
                ItemSeparatorComponent={Divider}
                onEndReached={
                  autoloadMore && hasQuery && statusesQuery.hasNextPage && !statusesQuery.isFetching
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
                ListFooterComponent={<LoadMore query={statusesQuery} />}
                onRefresh={activeStatusesQuery.refetch}
                refreshing={activeStatusesQuery.isRefetching}
              />
            )}
          </TabScreen>
          <TabScreen label={intl.formatMessage(messages.hashtags)}>
            {activeHashtagsQuery.isEnabled && activeHashtagsQuery.isPending ? (
              <LoadingIndicator />
            ) : (
              <FlashList
                data={activeHashtagsQuery.data}
                renderItem={({ item }) => <Hashtag tag={item.name} />}
                ItemSeparatorComponent={Divider}
                onEndReached={
                  autoloadMore && hasQuery && hashtagsQuery.hasNextPage && !hashtagsQuery.isFetching
                    ? hashtagsQuery.fetchNextPage
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
                ListFooterComponent={<LoadMore query={hashtagsQuery} />}
                onRefresh={activeHashtagsQuery.refetch}
                refreshing={activeHashtagsQuery.isRefetching}
              />
            )}
          </TabScreen>
          {features.trendingLinks && !hasQuery && (
            <TabScreen label={intl.formatMessage(messages.links)}>
              {trendingLinksQuery.data ? (
                <View style={{ margin: 8 }}>
                  <Carousel
                    data={trendingLinksQuery.data}
                    height={320}
                    renderItem={({ item, index, mask }) => (
                      <CarouselItem
                        mask={mask}
                        style={{
                          flexDirection: 'row',
                          gap: 8,
                          backgroundColor: colors.background,
                        }}
                      >
                        {index !== 0 && index === trendingLinksQuery.data.length - 1 && (
                          <View aria-hidden />
                        )}
                        <View style={{ flex: 1 }}>
                          <TrendsLink link={item} />
                        </View>
                        {index !== trendingLinksQuery.data.length - 1 && <View aria-hidden />}
                      </CarouselItem>
                    )}
                  />
                </View>
              ) : (
                <LoadingIndicator />
              )}
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
