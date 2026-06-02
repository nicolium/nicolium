import iconPaperPlaneRight from '@phosphor-icons/core/regular/paper-plane-right.svg';
import clsx from 'clsx';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import AutosuggestInput from '@/components/autosuggest-input';
import IconButton from '@/components/ui/icon-button';
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
      <div
        className={clsx('chat-composer chat-composer--shoutbox', {
          'chat-composer--framed': !widget,
        })}
      >
        <div className='chat-composer__row'>
          <div className='chat-composer__field'>
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

          <div className='chat-composer__side chat-composer__side--send'>
            {isOverCharacterLimit ? (
              <span className='chat-composer__limit'>{overLimitText}</span>
            ) : null}

            <IconButton
              src={iconPaperPlaneRight}
              className='chat-composer__send-button'
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
