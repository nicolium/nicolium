import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import Modal from '@/components/ui/modal';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

const messages = defineMessages({
  modalTitle: {
    id: 'missing_description_modal.text',
    defaultMessage: 'You have not entered a description for all attachments. Continue anyway?',
  },
  post: { id: 'missing_description_modal.continue', defaultMessage: 'Post' },
  cancel: { id: 'missing_description_modal.cancel', defaultMessage: 'Cancel' },
});

interface MissingDescriptionModalProps {
  onContinue: () => void;
}

const MissingDescriptionModal: React.FC<BaseModalProps & MissingDescriptionModalProps> = ({
  onClose,
  onContinue,
}) => {
  const intl = useIntl();

  return (
    <Modal
      className='missing-description-modal'
      title={intl.formatMessage(messages.modalTitle)}
      confirmationAction={onContinue}
      confirmationText={intl.formatMessage(messages.post)}
      confirmationTheme='danger'
      cancelText={intl.formatMessage(messages.cancel)}
      cancelAction={() => {
        onClose('MISSING_DESCRIPTION');
      }}
    >
      <p className='missing-description-modal__description' id='modal-description'>
        <FormattedMessage
          id='missing_description_modal.description'
          defaultMessage='Continue anyway?'
        />
      </p>
    </Modal>
  );
};

export { MissingDescriptionModal as default, type MissingDescriptionModalProps };
