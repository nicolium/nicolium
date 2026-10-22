import { ActivityIndicator, Chip, Divider, Text, useTheme } from '@mkljczk/react-native-paper';
import { FlashList, type FlashListRef, type ListRenderItem } from '@shopify/flash-list';
import { GlassView } from 'expo-glass-effect';
import { ProhibitIcon } from 'phosphor-react-native/src/icons/Prohibit';
import React, { useCallback, useRef } from 'react';
import { defineMessages, FormattedMessage, type MessageDescriptor, useIntl } from 'react-intl';
import { Pressable, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Status } from '@/components/statuses/status';
import { EmptyMessage, type IEmptyMessage } from '@/components/ui/empty-message';
import { iconHelper } from '@/components/ui/icon';
import { LoadMore } from '@/components/ui/load-more';
import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';
import { type TIMELINE_FILTER_KEYS, useSetting } from '@/stores/settings';
import { hasActiveFilters, sortFilteredTimeline } from '@/utils/timeline-filter';

import type { useTimeline } from '@/queries/timelines/use-timeline';
import type { TimelineEntry } from '@/stores/timelines';
import type { FilterContext } from 'pl-api';

const messages = defineMessages({
  queue: {
    id: 'status_list.queue.label.inline',
    defaultMessage: '{count} new {count, plural, one {post} other {posts}}',
  },
});

interface IScrollTopButton {
  /** Callback when clicked, and also when scrolled to the top. */
  onClick: () => void;
  /** Number of unread items. */
  count: number;
  /** Message to display in the button (should contain a `{count}` value). */
  message: MessageDescriptor;
  /** Distance from the top of the screen (scrolling down) before the button appears. */
  threshold?: number;
  /** Distance from the top of the screen (scrolling up) before the action is triggered. */
  autoloadThreshold?: number;
  /** Avatars of the accounts will display next to the message (limited to 3) */
  accountIds?: Array<string>;
}

const ScrollTopButton: React.FC<IScrollTopButton> = ({ message, onClick, count }) => {
  const glassEffect = useEnableLiquidGlass();
  const { colors } = useTheme();
  const intl = useIntl();
  const { top: topInset } = useSafeAreaInsets();

  // so that it doesn't show 0 while fading out
  const [displayedCount, setDisplayedCount] = React.useState(count);

  const containerTop = useSharedValue(count ? 72 + topInset : topInset);
  const containerOpacity = useSharedValue(Math.min(count, 1));
  const containerStyle = useAnimatedStyle(() => ({
    top: containerTop.value,
    opacity: containerOpacity.value,
  }));

  React.useEffect(() => {
    containerTop.value = withTiming(count ? 72 + topInset : topInset);
    containerOpacity.value = withTiming(Math.min(count, 1), { duration: count ? 300 : 100 });

    if (count !== 0) setDisplayedCount(count);
  }, [count]);

  return (
    <Animated.View
      style={[
        {
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          left: 0,
          right: 0,
          zIndex: 1,
        },
        containerStyle,
      ]}
    >
      {glassEffect ? (
        <Pressable onPress={onClick}>
          <GlassView
            isInteractive
            tintColor={colors.primaryContainer}
            style={{ padding: 8, paddingHorizontal: 16, borderRadius: 32 }}
          >
            <Text variant='bodyLarge'>
              {intl.formatMessage(message, {
                count: displayedCount,
              })}
            </Text>
          </GlassView>
        </Pressable>
      ) : (
        <Chip onPress={onClick} mode='flat'>
          {intl.formatMessage(message, {
            count: displayedCount,
          })}
        </Chip>
      )}
    </Animated.View>
  );
};

interface ITimeline extends IEmptyMessage {
  filtersKey?: (typeof TIMELINE_FILTER_KEYS)[number];
  query: ReturnType<typeof useTimeline>;
  pinnedQuery?: ReturnType<typeof useTimeline>;
  context?: FilterContext;
  header?: React.JSX.Element;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const Timeline: React.FC<ITimeline> = ({
  filtersKey,
  query,
  pinnedQuery,
  context = 'public',
  header,
  onScroll,
  ...props
}) => {
  const allFilters = useSetting('timelines.filters');
  const filters = filtersKey ? allFilters[filtersKey] : undefined;
  const { bottom: bottomInset } = useSafeAreaInsets();
  const autoloadMore = useSetting('timelines.autoloadMore');
  const flashListRef = useRef<FlashListRef<TimelineEntry>>(null);

  const renderItem: ListRenderItem<TimelineEntry> = useCallback(
    ({ item, index }) =>
      item.type === 'status' ? (
        <Status
          id={item.id}
          context={context}
          isConnectedBottom={item.isConnectedBottom}
          withLink
          rebloggedBy={item.rebloggedBy}
          showPinned={pinnedQuery && index < pinnedQuery?.entries.length}
        />
      ) : null,
    [pinnedQuery?.entries.length],
  );

  const ItemSeparatorComponent = useCallback(({ leadingItem }: { leadingItem: TimelineEntry }) => {
    if (leadingItem.type === 'status' && leadingItem.isConnectedBottom) return null;
    return <Divider />;
  }, []);

  const data = React.useMemo(() => {
    const processedPinnedEntries =
      pinnedQuery &&
      (hasActiveFilters(filters)
        ? sortFilteredTimeline(pinnedQuery.entries, filters)
        : pinnedQuery.entries);

    const processedEntries = hasActiveFilters(filters)
      ? sortFilteredTimeline(query.entries, filters)
      : query.entries;

    if (processedPinnedEntries) return [...processedPinnedEntries, ...processedEntries];
    return processedEntries;
  }, [query.entries, context, pinnedQuery?.entries, filters]);

  if (query.isPending)
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' />
      </View>
    );

  const handleScrollTop = () => {
    query.dequeueEntries();
    setTimeout(() => flashListRef.current?.scrollToTop(), 0);
  };

  return (
    <>
      {query.hasStreamConfig && (
        <ScrollTopButton
          onClick={handleScrollTop}
          count={query.queuedCount}
          message={messages.queue}
          accountIds={query.queuedAccountIds}
        />
      )}
      <FlashList
        ref={flashListRef}
        data={data}
        keyExtractor={(item, index) =>
          item.type === 'gap'
            ? `gap:${item.minId}`
            : pinnedQuery && index < pinnedQuery?.entries.length
              ? `pinned:${item.id}`
              : item.id
        }
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparatorComponent}
        onRefresh={() => {
          query.refetch();
          pinnedQuery?.refetch();
        }}
        refreshing={query.isRefetching}
        onEndReached={
          autoloadMore
            ? () => {
                if (query.hasNextPage && !query.isFetching) query.fetchNextPage();
              }
            : undefined
        }
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          query.isPending ? null : query.isError === 401 ? (
            <EmptyMessage
              emptyMessageIcon={iconHelper(ProhibitIcon)}
              emptyMessageText={
                <FormattedMessage
                  id='timeline.error.unauthorized'
                  defaultMessage='You are not authorized to view this timeline.'
                />
              }
            />
          ) : (
            <EmptyMessage {...props} />
          )
        }
        ListFooterComponent={<LoadMore query={query} />}
        ListHeaderComponent={header}
        onScroll={onScroll}
        contentContainerStyle={{ paddingBottom: bottomInset }}
        scrollIndicatorInsets={{ bottom: bottomInset }}
        getItemType={(item) => item.type}
      />
    </>
  );
};

export { Timeline, type ITimeline };
