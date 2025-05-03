import React from 'react';

import Modal from 'pl-fe/components/ui/modal';
import DetailedCryptoAddress from 'pl-fe/features/crypto-donate/components/detailed-crypto-address';

import type { ICryptoAddress } from 'pl-fe/features/crypto-donate/components/crypto-address';
import type { BaseModalProps } from 'pl-fe/features/ui/components/modal-root';

const CryptoDonateModal: React.FC<BaseModalProps & ICryptoAddress> = ({ onClose, ...props }) => {

  return (
    <Modal onClose={onClose} width='xs'>
      <DetailedCryptoAddress {...props} />
    </Modal>
  );

};

export { CryptoDonateModal as default };
