import React from 'react';
import { FormattedMessage } from 'react-intl';

import { DislikesList } from '@/columns/status-interactions';
import Modal from '@/components/ui/modal';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

interface DislikesModalProps {
  statusId: string;
}

const DislikesModal: React.FC<BaseModalProps & DislikesModalProps> = ({ onClose, statusId }) => (
  <Modal
    title={<FormattedMessage id='column.dislikes' defaultMessage='Dislikes' />}
    onClose={() => onClose('DISLIKES')}
  >
    <DislikesList statusId={statusId} />
  </Modal>
);

export { DislikesModal as default, type DislikesModalProps };
