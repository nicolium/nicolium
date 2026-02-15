import React from 'react';

import Modal from '@/components/ui/modal';
import DetailedCryptoAddress from '@/features/crypto-donate/components/detailed-crypto-address';

import type { ICryptoAddress } from '@/features/crypto-donate/components/crypto-address';
import type { BaseModalProps } from '@/features/ui/components/modal-root';

const CryptoDonateModal: React.FC<BaseModalProps & ICryptoAddress> = ({ onClose, ...props }) => {
  return (
    <Modal onClose={onClose} className='⁂-crypto-donate-map-modal'>
      <DetailedCryptoAddress {...props} />
    </Modal>
  );
};

export { CryptoDonateModal as default };
