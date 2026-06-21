import React from 'react';
import { FormattedMessage } from 'react-intl';

import { ReactionsList } from '@/columns/status-interactions';
import Modal from '@/components/ui/modal';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

interface ReactionsModalProps {
  statusId: string;
  reaction?: string;
}

const ReactionsModal: React.FC<BaseModalProps & ReactionsModalProps> = ({
  onClose,
  statusId,
  reaction,
}) => (
  <Modal
    title={<FormattedMessage id='column.reactions' defaultMessage='Reactions' />}
    onClose={() => onClose('REACTIONS')}
    className='reactions-modal'
  >
    <ReactionsList statusId={statusId} reaction={reaction} />
  </Modal>
);

export { ReactionsModal as default, type ReactionsModalProps };
