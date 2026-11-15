import { Text, TextInput } from '@mkljczk/react-native-paper';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { View } from 'react-native';

import { DialogOrSheet } from './ui/dialog-or-sheet';

const messages = defineMessages({
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
  clear: { id: 'text_field_modal.clear', defaultMessage: 'Clear' },
  charactersRemaining: {
    id: 'textarea.counter.label',
    defaultMessage: '{count, plural, one {# character} other {# characters}} remaining',
  },
});

interface ITextFieldDialog {
  heading: React.JSX.Element;
  message?: React.ReactNode;
  placeholder?: string;
  confirm: string;
  onConfirm: (value: string) => void;
  clear?: string;
  onClear?: () => void;
  onCancel?: () => void;
  text?: string;
  singleLine?: boolean;
  type?: 'text' | 'password';
  maxLength?: number;
  visible: boolean;
  onDismiss: () => void;
}

const TextFieldDialog: React.FC<ITextFieldDialog> = ({
  heading,
  message,
  placeholder,
  confirm,
  onConfirm,
  clear,
  onClear,
  onCancel,
  text,
  singleLine,
  type = 'text',
  maxLength,
  visible,
  onDismiss,
}) => {
  const intl = useIntl();

  const [closing, setClosing] = React.useState(false);
  const [value, setValue] = React.useState(text ?? '');

  const handleConfirm = () => {
    setClosing(true);
    onConfirm(value);
  };

  const handleClear = () => {
    setClosing(true);
    onClear?.();
  };

  const handleCancel = () => {
    setClosing(true);
    onCancel?.();
  };

  return (
    <DialogOrSheet
      visible={visible && !closing}
      handleDismiss={onDismiss}
      title={heading}
      actions={[
        {
          icon: 'arrow.left',
          label: intl.formatMessage(messages.cancel),
          onPress: handleCancel,
        },
        ...(onClear
          ? [
              {
                label: clear || intl.formatMessage(messages.clear),
                onPress: handleClear,
                destructive: true,
              },
            ]
          : []),
        {
          icon: 'checkmark',
          label: confirm,
          onPress: handleConfirm,
          confirm: true,
        },
      ]}
    >
      <View style={{ gap: 8 }}>
        {message && <Text variant='bodyMedium'>{message}</Text>}
        <TextInput
          value={value}
          onChangeText={setValue}
          variant='outlined'
          placeholder={placeholder}
          autoComplete='off'
          secureTextEntry={type === 'password'}
          multiline={!singleLine}
          numberOfLines={singleLine ? undefined : 4}
          maxLength={maxLength}
          supportingText={
            maxLength
              ? intl.formatMessage(messages.charactersRemaining, {
                  count: maxLength - value.length,
                })
              : undefined
          }
          style={singleLine ? undefined : { minHeight: 80 }}
        />
      </View>
    </DialogOrSheet>
  );
};

export { TextFieldDialog };
