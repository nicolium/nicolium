import React from 'react';
import { FormattedMessage } from 'react-intl';

import PullToRefresh from '@/components/pull-to-refresh';
import ScrollableList from '@/components/scrollable-list';
import Modal from '@/components/ui/modal';
import Spinner from '@/components/ui/spinner';
import AccountContainer from '@/containers/account-container';
import { useStatusReblogs } from '@/queries/statuses/use-status-interactions';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

interface ReblogsModalProps {
  statusId: string;
}

const ReblogsModal: React.FC<BaseModalProps & ReblogsModalProps> = ({ onClose, statusId }) => {
  const {
    data: accountIds,
    isLoading,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useStatusReblogs(statusId);

  const onClickClose = () => {
    onClose('REBLOGS');
  };

  let body;

  if (!accountIds) {
    body = <Spinner />;
  } else {
    const emptyMessage = (
      <FormattedMessage
        id='status.reblogs.empty'
        defaultMessage='No one has reposted this post yet. When someone does, they will show up here.'
      />
    );

    body = (
      <PullToRefresh onRefresh={refetch}>
        <ScrollableList
          emptyMessageText={emptyMessage}
          listClassName='max-w-full'
          itemClassName='pb-3'
          style={{ height: 'calc(80vh - 88px)' }}
          hasMore={hasNextPage}
          isLoading={isLoading}
          onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
          useWindowScroll={false}
        >
          {accountIds.map((id) => (
            <AccountContainer key={id} id={id} />
          ))}
        </ScrollableList>
      </PullToRefresh>
    );
  }

  return (
    <Modal
      title={<FormattedMessage id='column.reblogs' defaultMessage='Reposts' />}
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export { ReblogsModal as default, type ReblogsModalProps };
