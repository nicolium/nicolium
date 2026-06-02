import iconPaperPlaneRight from '@phosphor-icons/core/regular/paper-plane-right.svg';
import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import AutosuggestInput from '@/components/autosuggest-input';
import Button from '@/components/ui/button';
import IconButton from '@/components/ui/icon-button';
import { useChatContext } from '@/contexts/chat-context';
import UploadButton from '@/features/compose/components/upload-button';
import emojiSearch from '@/features/emoji/search';
import {
  useRelationshipQuery,
  useUnblockAccountMutation,
} from '@/queries/accounts/use-relationship';
import { useCustomEmojis } from '@/queries/instance/use-custom-emojis';
import { useInstance } from '@/stores/instance';
import { useModalsActions } from '@/stores/modals';

import ChatTextarea from './chat-textarea';

import type { AutoSuggestion } from '@/components/autosuggest-input';
import type { Emoji } from '@/features/emoji';
import type { MediaAttachment } from 'pl-api';

const messages = defineMessages({
  placeholder: { id: 'chat.input.placeholder', defaultMessage: 'Type a message' },
  send: { id: 'chat.actions.send', defaultMessage: 'Send' },
  unblockMessage: {
    id: 'chat_settings.unblock.message',
    defaultMessage:
      'Unblocking will allow this profile to direct message you and view your content.',
  },
  unblockHeading: { id: 'chat_settings.unblock.heading', defaultMessage: 'Unblock @{acct}' },
  unblockConfirm: { id: 'chat_settings.unblock.confirm', defaultMessage: 'Unblock' },
});

interface IChatComposer extends Pick<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'onKeyDown' | 'onChange' | 'onPaste' | 'disabled'
> {
  value: string;
  onSubmit: () => void;
  errorMessage: string | undefined;
  onSelectFile: (files: FileList) => void;
  resetFileKey: number | null;
  resetContentKey: number | null;
  attachment?: MediaAttachment | null;
  onDeleteAttachment?: () => void;
  uploading?: boolean;
  uploadProgress?: number;
}

/** Textarea input for chats. */
const ChatComposer = React.forwardRef<HTMLTextAreaElement | null, IChatComposer>(
  (
    {
      onKeyDown,
      onChange,
      value,
      onSubmit,
      errorMessage = false,
      disabled = false,
      onSelectFile,
      resetFileKey,
      resetContentKey,
      onPaste,
      attachment,
      onDeleteAttachment,
      uploading,
      uploadProgress,
    },
    ref,
  ) => {
    const intl = useIntl();

    const { openModal } = useModalsActions();
    const { chat } = useChatContext();
    const { data: relationship } = useRelationshipQuery(chat?.account.id);
    const { mutate: unblockAccount } = useUnblockAccountMutation(chat?.account.id!);
    const { data: customEmojis } = useCustomEmojis();

    const isBlocked = relationship?.blocked_by && false;
    const isBlocking = relationship?.blocking && false;

    const maxCharacterCount = useInstance().configuration.chats.max_characters;

    const [suggestions, setSuggestions] = useState<Emoji[]>([]);
    const isSuggestionsAvailable = suggestions.length > 0;

    const isOverCharacterLimit = maxCharacterCount && value?.length > maxCharacterCount;
    const isSubmitDisabled =
      disabled || (uploading ?? isOverCharacterLimit) || (value.length === 0 && !attachment);

    const overLimitText = maxCharacterCount ? maxCharacterCount - value?.length : '';

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(event);
      }
    };

    const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
      if (event.key === 'Enter' && !event.shiftKey && isSuggestionsAvailable) {
        return;
      }

      if (onKeyDown) {
        onKeyDown(event);
      }
    };

    const onSuggestionsFetchRequested = (token: string) => {
      const results = emojiSearch(token.replace(':', ''), customEmojis ?? [], 5);

      setSuggestions(results);
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

    const handleUnblockUser = () => {
      openModal('CONFIRM', {
        heading: intl.formatMessage(messages.unblockHeading, { acct: chat?.account.acct }),
        message: intl.formatMessage(messages.unblockMessage),
        confirm: intl.formatMessage(messages.unblockConfirm),
        onConfirm: () => {
          unblockAccount();
        },
      });
    };

    if (isBlocking) {
      return (
        <div className='chat-composer chat-composer--blocked'>
          <div className='chat-composer__blocked-body'>
            <p className='chat-composer__blocked-message'>
              <FormattedMessage
                id='chat_message_list.blocked'
                defaultMessage='You blocked this user'
              />
            </p>

            <Button theme='secondary' onClick={handleUnblockUser}>
              <FormattedMessage id='chat_composer.unblock' defaultMessage='Unblock' />
            </Button>
          </div>
        </div>
      );
    }

    if (isBlocked) {
      return null;
    }

    return (
      <div className='chat-composer'>
        {/* Spacer */}
        <div className='chat-composer__spacer' />

        <div className='chat-composer__row'>
          <div className='chat-composer__side chat-composer__side--upload'>
            <UploadButton
              onSelectFile={onSelectFile}
              resetFileKey={resetFileKey}
              className='chat-composer__send-button'
              disabled={uploading ?? !!attachment}
            />
          </div>

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
                attachment,
                onDeleteAttachment,
                uploading,
                uploadProgress,
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

        <div className='chat-composer__error__container'>
          {errorMessage && (
            <>
              <span className='chat-composer__error'>{errorMessage}</span>

              <button onClick={onSubmit} className='chat-composer__retry'>
                <FormattedMessage id='chat.retry' defaultMessage='Retry?' />
              </button>
            </>
          )}
        </div>
      </div>
    );
  },
);

ChatComposer.displayName = 'ChatComposer';

export { ChatComposer as default };
