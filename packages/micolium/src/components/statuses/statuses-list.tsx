import { Divider } from '@mkljczk/react-native-paper';
import { FlashList } from '@shopify/flash-list';
import React from 'react';

import { useSetting } from '@/stores/settings';

import { EmptyMessage } from '../ui/empty-message';
import { LoadMore } from '../ui/load-more';

import { Status } from './status';

import type { PaginatedResponseArray } from '@/queries/utils/make-paginated-response-query';
import type { UseInfiniteQueryResult } from '@tanstack/react-query';

interface IStatusesList {
  query: UseInfiniteQueryResult<PaginatedResponseArray<string>, Error>;
  emptyMessageText?: React.JSX.Element;
}

const StatusesList: React.FC<IStatusesList> = ({ query, emptyMessageText }) => {
  const autoloadMore = useSetting('timelines.autoloadMore');

  return (
    <FlashList
      data={query.data}
      renderItem={({ item }) => <Status id={item} withLink />}
      ItemSeparatorComponent={Divider}
      onEndReached={
        autoloadMore && query.hasNextPage && !query.isFetching ? query.fetchNextPage : undefined
      }
      onEndReachedThreshold={0.1}
      onRefresh={query.refetch}
      refreshing={query.isRefetching}
      ListEmptyComponent={
        !query.isPending ? <EmptyMessage emptyMessageText={emptyMessageText} /> : null
      }
      ListFooterComponent={<LoadMore query={query} />}
    />
  );
};

export { StatusesList };
