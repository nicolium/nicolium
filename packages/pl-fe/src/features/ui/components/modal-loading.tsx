import React from 'react';

import Modal from '@/components/ui/modal';
import Spinner from '@/components/ui/spinner';

const ModalLoading = () => (
  <Modal>
    <Spinner />
  </Modal>
);

export { ModalLoading as default };
