import iconPaperPlaneRight from '@phosphor-icons/core/regular/paper-plane-right.svg';
import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import AutosuggestInput from '@/components/autosuggest-input';
import Button from '@/components/ui/button';
import IconButton from '@/components/ui/icon-button';
import Text from '@/components/ui/text';
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
        <div className='mt-auto p-6 shadow-3xl dark:border-t-2 dark:border-solid dark:border-gray-800'>
          <div className='flex flex-col items-center gap-3'>
            <Text align='center' theme='muted'>
              <FormattedMessage
                id='chat_message_list.blocked'
                defaultMessage='You blocked this user'
              />
            </Text>

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
      <div className='mt-auto px-4 shadow-3xl'>
        {/* Spacer */}
        <div className='h-5' />

        <div className='flex items-stretch justify-between gap-4'>
          <div className='mb-1.5 flex w-10 flex-col items-center justify-end'>
            <UploadButton
              onSelectFile={onSelectFile}
              resetFileKey={resetFileKey}
              iconClassName='h-5 w-5'
              className='text-primary-500'
              disabled={uploading ?? !!attachment}
            />
          </div>

          <div className='flex grow flex-col'>
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

        <div className='flex h-5 items-center gap-1'>
          {errorMessage && (
            <>
              <Text theme='danger' size='xs'>
                {errorMessage}
              </Text>

              <button onClick={onSubmit} className='flex hover:underline'>
                <Text theme='primary' size='xs' tag='span'>
                  <FormattedMessage id='chat.retry' defaultMessage='Retry?' />
                </Text>
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
