import React from 'react';
import { FormattedMessage } from 'react-intl';

import { ReblogsList } from '@/columns/status-interactions';
import Modal from '@/components/ui/modal';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

interface ReblogsModalProps {
  statusId: string;
}

const ReblogsModal: React.FC<BaseModalProps & ReblogsModalProps> = ({ onClose, statusId }) => (
  <Modal
    title={<FormattedMessage id='column.reblogs' defaultMessage='Reposts' />}
    onClose={() => onClose('REBLOGS')}
  >
    <ReblogsList statusId={statusId} />
  </Modal>
);

export { ReblogsModal as default, type ReblogsModalProps };
