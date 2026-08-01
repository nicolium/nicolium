import React from 'react';
import { FormattedMessage } from 'react-intl';

import AccountList from '@/components/accounts/account-list';
import Modal from '@/components/ui/modal';
import { useStatus } from '@/queries/statuses/use-status';

import type { BaseModalProps } from '@/modals/modal-root';

interface MentionsModalProps {
  statusId: string;
}

const MentionsModal: React.FC<BaseModalProps & MentionsModalProps> = ({ onClose, statusId }) => {
  const { data: status } = useStatus(statusId);

  return (
    <Modal
      title={<FormattedMessage id='column.mentions' defaultMessage='Mentions' />}
      onClose={() => onClose('MENTIONS')}
    >
      <AccountList accountIds={status?.mentions.map((mention) => mention.id)} />
    </Modal>
  );
};

export { MentionsModal as default, type MentionsModalProps };
