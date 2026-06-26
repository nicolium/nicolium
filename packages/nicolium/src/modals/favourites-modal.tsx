import React from 'react';
import { FormattedMessage } from 'react-intl';

import { FavouritesList } from '@/columns/status-interactions';
import Modal from '@/components/ui/modal';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

interface FavouritesModalProps {
  statusId: string;
}

const FavouritesModal: React.FC<BaseModalProps & FavouritesModalProps> = ({
  onClose,
  statusId,
}) => (
  <Modal
    title={<FormattedMessage id='column.favourites' defaultMessage='Likes' />}
    onClose={() => onClose('FAVOURITES')}
  >
    <FavouritesList statusId={statusId} />
  </Modal>
);

export { FavouritesModal as default, type FavouritesModalProps };
