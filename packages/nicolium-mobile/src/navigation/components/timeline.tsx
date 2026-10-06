import { ActivityIndicator, Divider } from '@mkljczk/react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { ProhibitIcon } from 'phosphor-react-native';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import { Status } from '@/components/statuses/status';
import { EmptyMessage, type IEmptyMessage } from '@/components/ui/empty-message';
import { iconHelper } from '@/components/ui/icon';

import type { useTimeline } from '@/queries/timelines/use-timeline';
import type { TimelineEntry } from '@/stores/timelines';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

interface ITimeline extends IEmptyMessage {
  query: ReturnType<typeof useTimeline>;
  context?: 'home' | 'timeline';
  header?: React.JSX.Element;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const Timeline: React.FC<ITimeline> = ({
  query,
  context = 'timeline',
  header,
  onScroll,
  ...props
}) => {
  const renderItem = useCallback(
    ({ item }: { item: TimelineEntry }) =>
      item.type === 'status' ? (
        <Status
          id={item.id}
          context={context}
          isConnectedBottom={item.isConnectedBottom}
          withLink
          rebloggedBy={item.rebloggedBy}
        />
      ) : null,
    [],
  );

  const ItemSeparatorComponent = useCallback(({ leadingItem }: { leadingItem: TimelineEntry }) => {
    if (leadingItem.type === 'status' && leadingItem.isConnectedBottom) return null;
    return <Divider />;
  }, []);

  return (
    <FlashList
      data={query.entries}
      keyExtractor={(item) => (item.type === 'gap' ? item.minId : item.id)}
      renderItem={renderItem}
      ItemSeparatorComponent={ItemSeparatorComponent}
      onRefresh={query.refetch}
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
          <ActivityIndicator style={{ marginVertical: 8 }} />
        ) : undefined
      }
      ListHeaderComponent={header}
      onScroll={onScroll}
    />
  );
};

export { Timeline };
