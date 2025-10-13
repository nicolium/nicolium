import React from 'react';
import { FormattedMessage } from 'react-intl';

import PullToRefresh from 'pl-fe/components/pull-to-refresh';
import ScrollableList from 'pl-fe/components/scrollable-list';
import Modal from 'pl-fe/components/ui/modal';
import Spinner from 'pl-fe/components/ui/spinner';
import AccountContainer from 'pl-fe/containers/account-container';
import { useStatusDislikes } from 'pl-fe/queries/statuses/use-status-interactions';

import type { BaseModalProps } from 'pl-fe/features/ui/components/modal-root';

interface DislikesModalProps {
  statusId: string;
}

const DislikesModal: React.FC<BaseModalProps & DislikesModalProps> = ({ onClose, statusId }) => {
  const { data: accountIds, isLoading, hasNextPage, fetchNextPage, refetch } = useStatusDislikes(statusId);

  const onClickClose = () => {
    onClose('DISLIKES');
  };

  let body;

  if (!accountIds) {
    body = <Spinner />;
  } else {
    const emptyMessage = <FormattedMessage id='empty_column.dislikes' defaultMessage='No one has disliked this post yet. When someone does, they will show up here.' />;

    body = (
      <PullToRefresh onRefresh={refetch}>
        <ScrollableList
          emptyMessageText={emptyMessage}
          listClassName='max-w-full'
          itemClassName='pb-3'
          style={{ height: 'calc(80vh - 88px)' }}
          hasMore={hasNextPage}
          isLoading={typeof isLoading === 'boolean' ? isLoading : true}
          onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
          useWindowScroll={false}
        >
          {accountIds.map(id =>
            <AccountContainer key={id} id={id} />,
          )}
        </ScrollableList>
      </PullToRefresh>
    );
  }

  return (
    <Modal
      title={<FormattedMessage id='column.dislikes' defaultMessage='Dislikes' />}
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export { DislikesModal as default, type DislikesModalProps };
