import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import List, { ListItem } from '@/components/list';
import Modal from '@/components/ui/modal';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import Toggle from '@/components/ui/toggle';

import type { ButtonThemes } from '@/components/ui/button/useButtonStyles';
import type { BaseModalProps } from '@/features/ui/components/modal-root';

interface ConfirmationModalProps {
  heading?: React.ReactNode;
  message: React.ReactNode;
  confirm: React.ReactNode;
  onConfirm: () => void;
  secondary?: React.ReactNode;
  onSecondary?: () => void;
  onCancel?: () => void;
  checkbox?: string | false;
  confirmationTheme?: ButtonThemes;
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
  confirmationTheme = 'danger',
}) => {
  const [checked, setChecked] = useState(false);

  const handleClick = () => {
    onClose('CONFIRM');
    onConfirm();
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
      confirmationDisabled={!!checkbox && !checked}
      confirmationTheme={confirmationTheme}
      cancelText={<FormattedMessage id='confirmation_modal.cancel' defaultMessage='Cancel' />}
      cancelAction={handleCancel}
      secondaryText={secondary}
      secondaryAction={onSecondary && handleSecondary}
    >
      <Stack space={4}>
        <Text id='modal-description'>{message}</Text>

        {checkbox && (
          <List>
            <ListItem label={checkbox}>
              <Toggle checked={checked} onChange={handleCheckboxChange} required />
            </ListItem>
          </List>
        )}
      </Stack>
    </Modal>
  );
};

export { ConfirmationModal as default, type ConfirmationModalProps };
