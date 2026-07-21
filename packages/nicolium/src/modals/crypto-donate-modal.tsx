import React from 'react';

import DetailedCryptoAddress from '@/components/crypto-donate/detailed-crypto-address';
import Modal from '@/components/ui/modal';

import type { ICryptoAddress } from '@/components/crypto-donate/crypto-address';
import type { BaseModalProps } from '@/modals/modal-root';

const CryptoDonateModal: React.FC<BaseModalProps & ICryptoAddress> = ({ onClose, ...props }) => (
  <Modal onClose={onClose} className='crypto-donate-modal'>
    <DetailedCryptoAddress {...props} />
  </Modal>
);

export { CryptoDonateModal as default };
