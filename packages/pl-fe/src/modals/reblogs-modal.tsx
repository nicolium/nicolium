import React from 'react';
import { FormattedMessage } from 'react-intl';

import ScrollableList from 'pl-fe/components/scrollable-list';
import Modal from 'pl-fe/components/ui/modal';
import Spinner from 'pl-fe/components/ui/spinner';
import AccountContainer from 'pl-fe/containers/account-container';
import { useStatusReblogs } from 'pl-fe/queries/statuses/use-status-interactions';

import type { BaseModalProps } from 'pl-fe/features/ui/components/modal-root';

interface ReblogsModalProps {
  statusId: string;
}

const ReblogsModal: React.FC<BaseModalProps & ReblogsModalProps> = ({ onClose, statusId }) => {
  const { data: accountIds, isLoading, hasNextPage, fetchNextPage } = useStatusReblogs(statusId);

  const onClickClose = () => {
    onClose('REBLOGS');
  };

  let body;

  if (!accountIds) {
    body = <Spinner />;
  } else {
    const emptyMessage = <FormattedMessage id='status.reblogs.empty' defaultMessage='No one has reposted this post yet. When someone does, they will show up here.' />;

    body = (
      <ScrollableList
        emptyMessage={emptyMessage}
        listClassName='max-w-full'
        itemClassName='pb-3'
        style={{ height: 'calc(80vh - 88px)' }}
        hasMore={hasNextPage}
        isLoading={typeof isLoading === 'boolean' ? isLoading : true}
        onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
        useWindowScroll={false}
      >
        {accountIds.map((id) =>
          <AccountContainer key={id} id={id} />,
        )}
      </ScrollableList>
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
