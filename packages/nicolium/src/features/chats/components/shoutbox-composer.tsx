import iconPaperPlaneRight from '@phosphor-icons/core/regular/paper-plane-right.svg';
import clsx from 'clsx';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import AutosuggestInput from '@/components/autosuggest-input';
import IconButton from '@/components/ui/icon-button';
import Text from '@/components/ui/text';
import emojiSearch from '@/features/emoji/search';
import { useInstance } from '@/stores/instance';

import ChatTextarea from './chat-textarea';

import type { AutoSuggestion } from '@/components/autosuggest-input';
import type { Emoji } from '@/features/emoji';

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
  widget?: boolean;
}

const ShoutboxComposer = React.forwardRef<HTMLTextAreaElement | null, IShoutboxComposer>(
  (
    { onKeyDown, onChange, value, onSubmit, disabled = false, resetContentKey, onPaste, widget },
    ref,
  ) => {
    const intl = useIntl();

    const maxCharacterCount = useInstance().configuration.chats.max_characters;
    const [suggestions, setSuggestions] = useState<Emoji[]>([]);

    const isOverCharacterLimit = maxCharacterCount && value?.length > maxCharacterCount;
    const isSubmitDisabled = disabled || isOverCharacterLimit || value.length === 0;

    const overLimitText = maxCharacterCount ? maxCharacterCount - value?.length : '';

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

    const onSuggestionsFetchRequested = (token: string) => {
      setSuggestions(emojiSearch(token.replace(':', ''), [], 5, false));
    };

    const onSuggestionsClearRequested = () => {
      setSuggestions([]);
    };

    const onSuggestionSelected = (
      tokenStart: number,
      token: string | null,
      emoji: AutoSuggestion,
    ) => {
      if (!token || typeof emoji === 'string' || 'origin_id' in emoji) {
        return;
      }

      const insertion = `${'native' in emoji ? emoji.native : emoji.colons} `;
      const nextValue = `${value.slice(0, tokenStart)}${insertion}${value.slice(tokenStart + token.length)}`;
      const event = { target: { value: nextValue } } as React.ChangeEvent<HTMLTextAreaElement>;

      if (onChange) {
        onChange(event);
      }

      setSuggestions([]);
    };

    return (
      <div className={clsx('mt-auto pt-5 shadow-3xl', !widget && 'px-4 pb-5')}>
        <div className='flex items-stretch justify-between gap-4'>
          <div className='flex flex-grow flex-col'>
            <AutosuggestInput
              key={resetContentKey}
              as={ChatTextarea}
              autoFocus
              ref={ref as React.ForwardedRef<HTMLInputElement | HTMLTextAreaElement>}
              placeholder={intl.formatMessage(messages.placeholder)}
              onKeyDown={handleKeyDown}
              value={value}
              onChange={handleChange}
              disabled={disabled}
              suggestions={suggestions}
              onSuggestionsFetchRequested={onSuggestionsFetchRequested}
              onSuggestionsClearRequested={onSuggestionsClearRequested}
              onSuggestionSelected={onSuggestionSelected}
              searchTokens={[':']}
              inputProps={{
                onPaste,
                isResizeable: false,
                autoGrow: true,
                maxRows: 5,
                disabled,
              }}
            />
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
