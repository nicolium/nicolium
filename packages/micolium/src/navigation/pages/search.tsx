import { Carousel, CarouselItem, Divider, Searchbar, useTheme } from '@mkljczk/react-native-paper';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { debounce } from '@tanstack/react-pacer/debouncer';
import React, { useCallback, useEffect, useMemo } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabView } from 'react-native-tab-view';

import { Account } from '@/components/accounts/account';
import { Hashtag } from '@/components/hashtag';
import { Status } from '@/components/statuses/status';
import { TrendsLink } from '@/components/trends-link';
import { EmptyMessage } from '@/components/ui/empty-message';
import { LoadMore } from '@/components/ui/load-more';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { TabBar } from '@/components/ui/tab-bar';
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
  searchPlaceholder: { id: 'search.placeholder', defaultMessage: 'Search the Fediverse' },
});

const SEARCH_TYPES = ['accounts', 'statuses', 'hashtags', 'links'] as const;

type SearchType = (typeof SEARCH_TYPES)[number];

interface ISearchResults {
  query: string;
}

const AccountsResults: React.FC<ISearchResults> = ({ query }) => {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const autoloadMore = useSetting('timelines.autoloadMore');

  const trimmedQuery = query.trim() || '';

  const accountsQuery = useSearchAccounts(trimmedQuery);
  const trendingAccountsQuery = useSuggestedAccounts(!trimmedQuery);

  const activeAccountsQuery = trimmedQuery ? accountsQuery : trendingAccountsQuery;

  return activeAccountsQuery.isPending && activeAccountsQuery.isEnabled ? (
    <LoadingIndicator />
  ) : (
    <FlashList
      contentContainerStyle={{ paddingBottom: bottomInset }}
      scrollIndicatorInsets={{ bottom: bottomInset }}
      data={
        trimmedQuery
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
        autoloadMore && trimmedQuery && accountsQuery.hasNextPage && !accountsQuery.isFetching
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
                values={{ term: trimmedQuery }}
              />
            }
          />
        ) : null
      }
      ListFooterComponent={<LoadMore query={accountsQuery} />}
      onRefresh={activeAccountsQuery.refetch}
      refreshing={activeAccountsQuery.isRefetching}
    />
  );
};

const StatusesResults: React.FC<ISearchResults> = ({ query }) => {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const autoloadMore = useSetting('timelines.autoloadMore');

  const trimmedQuery = query.trim() || '';

  const statusesQuery = useSearchStatuses(trimmedQuery);
  const trendingStatusesQuery = useTrendingStatuses(!trimmedQuery);

  const activeStatusesQuery = trimmedQuery ? statusesQuery : trendingStatusesQuery;

  return activeStatusesQuery.isEnabled && activeStatusesQuery.isPending ? (
    <LoadingIndicator />
  ) : (
    <FlashList
      contentContainerStyle={{ paddingBottom: bottomInset }}
      scrollIndicatorInsets={{ bottom: bottomInset }}
      data={activeStatusesQuery.data}
      renderItem={({ item }) => <Status id={item} withLink />}
      ItemSeparatorComponent={Divider}
      onEndReached={
        autoloadMore && trimmedQuery && statusesQuery.hasNextPage && !statusesQuery.isFetching
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
                values={{ term: trimmedQuery }}
              />
            }
          />
        ) : null
      }
      ListFooterComponent={<LoadMore query={statusesQuery} />}
      onRefresh={activeStatusesQuery.refetch}
      refreshing={activeStatusesQuery.isRefetching}
    />
  );
};

const HashtagsResults: React.FC<ISearchResults> = ({ query }) => {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const autoloadMore = useSetting('timelines.autoloadMore');

  const trimmedQuery = query.trim() || '';

  const hashtagsQuery = useSearchHashtags(trimmedQuery);
  const trendingHashtagsQuery = useTrendingTags(!trimmedQuery);

  const activeHashtagsQuery = trimmedQuery ? hashtagsQuery : trendingHashtagsQuery;

  return activeHashtagsQuery.isEnabled && activeHashtagsQuery.isPending ? (
    <LoadingIndicator />
  ) : (
    <FlashList
      contentContainerStyle={{ paddingBottom: bottomInset }}
      scrollIndicatorInsets={{ bottom: bottomInset }}
      data={activeHashtagsQuery.data}
      renderItem={({ item }) => <Hashtag tag={item.name} />}
      ItemSeparatorComponent={Divider}
      onEndReached={
        autoloadMore && trimmedQuery && hashtagsQuery.hasNextPage && !hashtagsQuery.isFetching
          ? hashtagsQuery.fetchNextPage
          : undefined
      }
      onEndReachedThreshold={0.1}
      ListEmptyComponent={
        !hashtagsQuery.isPending ? (
          <EmptyMessage
            emptyMessageText={
              <FormattedMessage
                id='empty_column.search.hashtags'
                defaultMessage='There are no tags results for "{term}"'
                values={{ term: trimmedQuery }}
              />
            }
          />
        ) : null
      }
      ListFooterComponent={<LoadMore query={hashtagsQuery} />}
      onRefresh={activeHashtagsQuery.refetch}
      refreshing={activeHashtagsQuery.isRefetching}
    />
  );
};

const LinksResults: React.FC = () => {
  const { colors } = useTheme();

  const trendingLinksQuery = useTrendingLinks();

  return trendingLinksQuery.data ? (
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
            {index !== 0 && index === trendingLinksQuery.data.length - 1 && <View aria-hidden />}
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
  );
};

const SearchScreen = ({
  route,
  navigation,
}: NativeStackScreenProps<SearchStackParams, 'search'>) => {
  const intl = useIntl();
  const { top: topInset } = useSafeAreaInsets();
  const { colors } = useTheme();
  const features = useFeatures();

  const { type: activeType = 'accounts', query: activeQuery = '' } = route.params || {};

  const [enteredQuery, setEnteredQuery] = React.useState(activeQuery || '');

  const hasQuery = activeQuery.trim().length > 0;

  useEffect(() => {
    if (activeType === 'links' && hasQuery) {
      navigation.setParams({ type: 'accounts' });
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

  const routes = useMemo(() => {
    const routes: Array<{
      key: SearchType;
      title: string;
    }> = [
      { key: 'accounts', title: intl.formatMessage(messages.accounts) },
      { key: 'statuses', title: intl.formatMessage(messages.statuses) },
      { key: 'hashtags', title: intl.formatMessage(messages.hashtags) },
    ];

    if (!hasQuery && features.trendingLinks) {
      routes.push({
        key: 'links',
        title: intl.formatMessage(messages.links),
      });
    }

    return routes;
  }, [intl, hasQuery]);

  const renderScene = (route: SearchType) => {
    switch (route) {
      case 'accounts':
        return <AccountsResults query={activeQuery} />;
      case 'statuses':
        return <StatusesResults query={activeQuery} />;
      case 'hashtags':
        return <HashtagsResults query={activeQuery} />;
      case 'links':
        return <LinksResults />;
    }
  };

  let index = SEARCH_TYPES.indexOf(route.params?.type || 'accounts');
  if (index === 3 && routes.length === 3) index = 0;

  const tabBarKey = features.trendingLinks && !hasQuery ? 'with-links' : 'without-links';

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
          placeholder={intl.formatMessage(messages.searchPlaceholder)}
          value={enteredQuery}
          onChangeText={setQuery}
        />
      </View>
      <TabView
        navigationState={{ index, routes }}
        onIndexChange={handleChangeIndex}
        renderScene={({ route }) => renderScene(route.key)}
        renderTabBar={(props) => <TabBar {...props} key={tabBarKey} />}
        lazy
      />
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
