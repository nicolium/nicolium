import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import Textarea from '@/components/ui/textarea';

import type { ButtonThemes } from '@/components/ui/button/useButtonStyles';
import type { BaseModalProps } from '@/features/ui/components/modal-root';

interface TextFieldModalProps {
  heading: React.ReactNode;
  message?: React.ReactNode;
  placeholder?: string;
  confirm: React.ReactNode;
  onConfirm: (value: string) => void;
  clear?: React.ReactNode;
  onClear?: () => void;
  onCancel?: () => void;
  confirmationTheme?: ButtonThemes;
  text?: string;
  singleLine?: boolean;
  type?: 'text' | 'password';
}

const TextFieldModal: React.FC<TextFieldModalProps & BaseModalProps> = ({
  heading,
  message,
  placeholder,
  confirm,
  clear,
  onClose,
  onConfirm,
  onClear,
  onCancel,
  confirmationTheme,
  text,
  singleLine,
  type = 'text',
}) => {
  const [value, setValue] = useState(text ?? '');

  const handleClick = () => {
    onClose('TEXT_FIELD');
    onConfirm(value);
  };

  const handleClear = onClear
    ? () => {
        onClose('TEXT_FIELD');
        onClear();
      }
    : undefined;

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
      secondaryText={
        clear || <FormattedMessage id='text_field_modal.clear' defaultMessage='Clear' />
      }
      secondaryAction={handleClear}
      cancelText={<FormattedMessage id='confirmation_modal.cancel' defaultMessage='Cancel' />}
      cancelAction={handleCancel}
    >
      <div className='text-field-modal'>
        {message && <p>{message}</p>}

        {singleLine ? (
          <Input
            type={type}
            value={value}
            onChange={({ target }) => {
              setValue(target.value);
            }}
            autoComplete='off'
            placeholder={placeholder}
          />
        ) : (
          <Textarea
            value={value}
            onChange={({ target }) => {
              setValue(target.value);
            }}
            autoComplete='off'
            placeholder={placeholder}
          />
        )}
      </div>
    </Modal>
  );
};

export { type TextFieldModalProps, TextFieldModal as default };
