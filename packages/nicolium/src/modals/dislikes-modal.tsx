import React from 'react';
import { FormattedMessage } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import PullToRefresh from '@/components/pull-to-refresh';
import ScrollableList from '@/components/scrollable-list';
import Modal from '@/components/ui/modal';
import Spinner from '@/components/ui/spinner';
import { useStatusDislikes } from '@/queries/statuses/use-status-interactions';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

interface DislikesModalProps {
  statusId: string;
}

const DislikesModal: React.FC<BaseModalProps & DislikesModalProps> = ({ onClose, statusId }) => {
  const {
    data: accountIds,
    isLoading,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useStatusDislikes(statusId);

  const onClickClose = () => {
    onClose('DISLIKES');
  };

  let body;

  if (!accountIds) {
    body = <Spinner />;
  } else {
    const emptyMessage = (
      <FormattedMessage
        id='empty_column.dislikes'
        defaultMessage='No one has disliked this post yet. When someone does, they will show up here.'
      />
    );

    body = (
      <PullToRefresh onRefresh={refetch}>
        <ScrollableList
          emptyMessageText={emptyMessage}
          listClassName='modal__list'
          itemClassName='modal__list__item'
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
      title={<FormattedMessage id='column.dislikes' defaultMessage='Dislikes' />}
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export { DislikesModal as default, type DislikesModalProps };
