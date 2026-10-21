import { Divider } from '@mkljczk/react-native-paper';
import { FlashList } from '@shopify/flash-list';
import React from 'react';

import { useSetting } from '@/stores/settings';

import { EmptyMessage } from '../ui/empty-message';
import { LoadMore } from '../ui/load-more';

import { Account, type IAccount } from './account';

import type { PaginatedResponseArray } from '@/queries/utils/make-paginated-response-query';
import type { UseInfiniteQueryResult } from '@tanstack/react-query';

interface IAccountsList {
  query: UseInfiniteQueryResult<PaginatedResponseArray<string>, Error>;
  emptyMessageText?: React.JSX.Element;
  actionType?: IAccount['actionType'];
}

const AccountsList: React.FC<IAccountsList> = ({ query, emptyMessageText, actionType }) => {
  const autoloadMore = useSetting('timelines.autoloadMore');

  return (
    <FlashList
      data={query.data}
      renderItem={({ item }) => (
        <Account
          id={item}
          style={{ paddingVertical: 8, padding: 12 }}
          withLink
          withFollowButton={!actionType}
          actionType={actionType}
        />
      )}
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

export { AccountsList };
