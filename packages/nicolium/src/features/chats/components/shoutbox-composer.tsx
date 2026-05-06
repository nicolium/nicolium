import iconPaperPlaneRight from '@phosphor-icons/core/regular/paper-plane-right.svg';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Combobox, { ComboboxInput } from '@/components/ui/combobox';
import IconButton from '@/components/ui/icon-button';
import Text from '@/components/ui/text';
import { useInstance } from '@/stores/instance';

import ChatTextarea from './chat-textarea';

const messages = defineMessages({
  placeholder: { id: 'chat.input.placeholder', defaultMessage: 'Type a message' },
  send: { id: 'chat.actions.send', defaultMessage: 'Send' },
  retry: { id: 'chat.retry', defaultMessage: 'Retry?' },
});

interface IShoutboxComposer extends Pick<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'onKeyDown' | 'onChange' | 'onPaste' | 'disabled'
> {
  value: string;
  onSubmit: () => void;
  resetContentKey: number | null;
}

const ShoutboxComposer = React.forwardRef<HTMLTextAreaElement | null, IShoutboxComposer>(
  ({ onKeyDown, onChange, value, onSubmit, disabled = false, resetContentKey, onPaste }, ref) => {
    const intl = useIntl();

    const maxCharacterCount = useInstance().configuration.chats.max_characters;

    const isOverCharacterLimit = maxCharacterCount && value?.length > maxCharacterCount;
    const isSubmitDisabled = disabled || isOverCharacterLimit || value.length === 0;

    const overLimitText = maxCharacterCount ? maxCharacterCount - value?.length : '';

    const onSelectComboboxOption = (selection: string) => {
      const event = { target: { value: selection } } as React.ChangeEvent<HTMLTextAreaElement>;

      if (onChange) {
        onChange(event);
      }
    };

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(event);
      }
    };

    const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
      if (onKeyDown) {
        onKeyDown(event);
      }
    };

    return (
      <div className='mt-auto px-4 py-5 shadow-3xl'>
        <div className='flex items-stretch justify-between gap-4'>
          <div className='flex flex-grow flex-col'>
            <Combobox onSelect={onSelectComboboxOption}>
              <ComboboxInput
                key={resetContentKey}
                as={ChatTextarea}
                autoFocus
                ref={ref}
                placeholder={intl.formatMessage(messages.placeholder)}
                onKeyDown={handleKeyDown}
                value={value}
                onChange={handleChange}
                onPaste={onPaste}
                isResizeable={false}
                autoGrow
                maxRows={5}
                disabled={disabled}
              />
            </Combobox>
          </div>

          <div className='mb-1.5 flex w-10 flex-col items-center justify-end gap-2'>
            {isOverCharacterLimit ? (
              <Text size='sm' theme='danger'>
                {overLimitText}
              </Text>
            ) : null}

            <IconButton
              src={iconPaperPlaneRight}
              iconClassName='h-5 w-5'
              className='text-primary-500'
              disabled={isSubmitDisabled}
              onClick={onSubmit}
              title={intl.formatMessage(messages.send)}
            />
          </div>
        </div>
      </div>
    );
  },
);

ShoutboxComposer.displayName = 'ShoutboxComposer';

export { ShoutboxComposer as default };
