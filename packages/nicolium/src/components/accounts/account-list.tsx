import React from 'react';

import AccountContainer from '@/components/accounts/account-container';
import PullToRefresh from '@/components/pull-to-refresh';
import ScrollableList from '@/components/scrollable-list';
import Spinner from '@/components/ui/spinner';
import { useColumnScrollParent } from '@/contexts/multi-column-context';

const DefaultRenderer = (accountId: string): React.ReactNode => (
  <AccountContainer key={accountId} id={accountId} />
);

interface IAccountList {
  accountIds?: Array<string>;
  isLoading?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  refetch?: () => Promise<unknown>;
  emptyMessage?: React.ReactNode;
  renderAccount?: (accountId: string) => React.ReactNode;
}

const AccountList: React.FC<IAccountList> = ({
  accountIds,
  isLoading,
  hasNextPage,
  fetchNextPage,
  refetch,
  emptyMessage,
  renderAccount = DefaultRenderer,
}) => {
  const inColumn = !!useColumnScrollParent();

  if (!accountIds) return <Spinner />;

  const list = (
    <ScrollableList
      emptyMessageText={emptyMessage}
      listClassName='modal__list'
      itemClassName='modal__list__item'
      style={inColumn ? undefined : { height: 'calc(80vh - 88px)' }}
      hasMore={hasNextPage}
      isLoading={isLoading}
      onLoadMore={fetchNextPage}
      useWindowScroll={false}
    >
      {accountIds.map(renderAccount)}
    </ScrollableList>
  );

  if (!refetch) return list;

  return <PullToRefresh onRefresh={refetch}>{list}</PullToRefresh>;
};

export { AccountList as default, AccountList };
