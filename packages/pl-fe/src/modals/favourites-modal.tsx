import React from 'react';
import { FormattedMessage } from 'react-intl';

import PullToRefresh from '@/components/pull-to-refresh';
import ScrollableList from '@/components/scrollable-list';
import Modal from '@/components/ui/modal';
import Spinner from '@/components/ui/spinner';
import AccountContainer from '@/containers/account-container';
import { useStatusFavourites } from '@/queries/statuses/use-status-interactions';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

interface FavouritesModalProps {
  statusId: string;
}

const FavouritesModal: React.FC<BaseModalProps & FavouritesModalProps> = ({ onClose, statusId }) => {
  const { data: accountIds, isLoading, hasNextPage, fetchNextPage, refetch } = useStatusFavourites(statusId);

  const onClickClose = () => {
    onClose('FAVOURITES');
  };

  let body;

  if (!accountIds) {
    body = <Spinner />;
  } else {
    const emptyMessage = <FormattedMessage id='empty_column.favourites' defaultMessage='No one has liked this post yet. When someone does, they will show up here.' />;

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
      title={<FormattedMessage id='column.favourites' defaultMessage='Likes' />}
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export { FavouritesModal as default, type FavouritesModalProps };
