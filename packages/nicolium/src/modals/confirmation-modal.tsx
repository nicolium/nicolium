import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import List, { ListItem } from '@/components/list';
import Modal from '@/components/ui/modal';
import Toggle from '@/components/ui/toggle';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

interface ConfirmationModalProps {
  heading?: React.ReactNode;
  message: React.ReactNode;
  confirm: React.ReactNode;
  onConfirm: (checked: boolean) => void;
  secondary?: React.ReactNode;
  onSecondary?: () => void;
  onCancel?: () => void;
  checkbox?: string | false;
  checkboxRequired?: boolean;
  theme?: 'default' | 'danger';
}

const ConfirmationModal: React.FC<BaseModalProps & ConfirmationModalProps> = ({
  heading,
  message,
  confirm,
  onClose,
  onConfirm,
  secondary,
  onSecondary,
  onCancel,
  checkbox,
  checkboxRequired,
  theme = 'danger',
}) => {
  const [checked, setChecked] = useState(false);

  const handleClick = () => {
    onClose('CONFIRM');
    onConfirm(checked);
  };

  const handleSecondary = () => {
    onClose('CONFIRM');
    onSecondary!();
  };

  const handleCancel = () => {
    onClose('CONFIRM');
    if (onCancel) onCancel();
  };

  const handleCheckboxChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setChecked(e.target.checked);
  };

  return (
    <Modal
      title={heading}
      confirmationAction={handleClick}
      confirmationText={confirm}
      confirmationDisabled={!!checkboxRequired && !checked}
      confirmationTheme={theme === 'danger' ? 'danger' : undefined}
      cancelText={<FormattedMessage id='confirmation_modal.cancel' defaultMessage='Cancel' />}
      cancelAction={handleCancel}
      secondaryText={secondary}
      secondaryAction={onSecondary && handleSecondary}
    >
      <div className='confirmation-modal'>
        <p id='modal-description'>{message}</p>

        {checkbox && (
          <List>
            <ListItem label={checkbox}>
              <Toggle checked={checked} onChange={handleCheckboxChange} required />
            </ListItem>
          </List>
        )}
      </div>
    </Modal>
  );
};

export { ConfirmationModal as default, type ConfirmationModalProps };
