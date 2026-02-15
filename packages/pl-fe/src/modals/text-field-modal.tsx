import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import Stack from '@/components/ui/stack';
import Textarea from '@/components/ui/textarea';

import type { ButtonThemes } from '@/components/ui/button/useButtonStyles';
import type { BaseModalProps } from '@/features/ui/components/modal-root';

interface TextFieldModalProps {
  heading: React.ReactNode;
  placeholder?: string;
  confirm: React.ReactNode;
  onConfirm: (value: string) => void;
  onCancel?: () => void;
  confirmationTheme?: ButtonThemes;
  text?: string;
  singleLine?: boolean;
}

const TextFieldModal: React.FC<TextFieldModalProps & BaseModalProps> = ({
  heading,
  placeholder,
  confirm,
  onClose,
  onConfirm,
  onCancel,
  confirmationTheme,
  text,
  singleLine,
}) => {
  const [value, setValue] = useState(text ?? '');

  const handleClick = () => {
    onClose('TEXT_FIELD');
    onConfirm(value);
  };

  const handleCancel = () => {
    onClose('TEXT_FIELD');
    if (onCancel) onCancel();
  };

  return (
    <Modal
      title={heading}
      confirmationAction={handleClick}
      confirmationText={confirm}
      confirmationTheme={confirmationTheme}
      cancelText={<FormattedMessage id='confirmation_modal.cancel' defaultMessage='Cancel' />}
      cancelAction={handleCancel}
    >
      <Stack space={4}>
        {singleLine ? (
          <Input
            type='text'
            value={value}
            onChange={({ target }) =>{
              setValue(target.value);
            }}
            autoComplete='off'
            placeholder={placeholder}
          />
        ) : (
          <Textarea
            value={value}
            onChange={({ target }) =>{
              setValue(target.value);
            }}
            autoComplete='off'
            placeholder={placeholder}
          />
        )}
      </Stack>
    </Modal>
  );
};

export { type TextFieldModalProps, TextFieldModal as default };
