import React from 'react';
import { FormattedMessage } from 'react-intl';

import ScrollableList from '@/components/scrollable-list';
import Modal from '@/components/ui/modal';
import AccountContainer from '@/containers/account-container';
import { useStatus } from '@/queries/statuses/use-status';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

interface MentionsModalProps {
  statusId: string;
}

const MentionsModal: React.FC<BaseModalProps & MentionsModalProps> = ({ onClose, statusId }) => {
  const { data: status } = useStatus(statusId);
  const accountIds = status ? status.mentions.map((m) => m.id) : null;

  const onClickClose = () => {
    onClose('MENTIONS');
  };

  return (
    <Modal
      title={<FormattedMessage id='column.mentions' defaultMessage='Mentions' />}
      onClose={onClickClose}
    >
      <ScrollableList
        listClassName='max-w-full'
        itemClassName='pb-3'
        style={{ height: 'calc(80vh - 88px)' }}
        isLoading={!accountIds}
        useWindowScroll={false}
      >
        {(accountIds ?? []).map((id) => (
          <AccountContainer key={id} id={id} />
        ))}
      </ScrollableList>
    </Modal>
  );
};

export { MentionsModal as default, type MentionsModalProps };
