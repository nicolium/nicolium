import { ActivityIndicator, Divider } from '@mkljczk/react-native-paper';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { ProhibitIcon } from 'phosphor-react-native';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { Status } from '@/components/statuses/status';
import { EmptyMessage, type IEmptyMessage } from '@/components/ui/empty-message';
import { iconHelper } from '@/components/ui/icon';

import type { useTimeline } from '@/queries/timelines/use-timeline';
import type { TimelineEntry } from '@/stores/timelines';

interface ITimeline extends IEmptyMessage {
  query: ReturnType<typeof useTimeline>;
  pinnedQuery?: ReturnType<typeof useTimeline>;
  context?: 'home' | 'timeline';
  header?: React.JSX.Element;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const Timeline: React.FC<ITimeline> = ({
  query,
  pinnedQuery,
  context = 'timeline',
  header,
  onScroll,
  ...props
}) => {
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

  const data = React.useMemo(
    () => (pinnedQuery ? [...pinnedQuery.entries, ...query.entries] : query.entries),
    [query.entries, pinnedQuery?.entries],
  );

  if (query.isPending)
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' />
      </View>
    );

  return (
    <FlashList
      data={data}
      keyExtractor={(item) => (item.type === 'gap' ? item.minId : item.id)}
      renderItem={renderItem}
      ItemSeparatorComponent={ItemSeparatorComponent}
      onRefresh={query.refetch}
      refreshing={query.isFetching}
      onEndReached={() => {
        if (query.hasNextPage && !query.isFetching) query.fetchNextPage();
      }}
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
      ListFooterComponent={
        query.isFetching && !query.isPending ? (
          <ActivityIndicator style={{ marginVertical: 8 }} size='large' />
        ) : undefined
      }
      ListHeaderComponent={header}
      onScroll={onScroll}
    />
  );
};

export { Timeline };
