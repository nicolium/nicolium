import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Button from '@/components/ui/button';
import Combobox, {
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover,
} from '@/components/ui/combobox';
import HStack from '@/components/ui/hstack';
import IconButton from '@/components/ui/icon-button';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import { useChatContext } from '@/contexts/chat-context';
import UploadButton from '@/features/compose/components/upload-button';
import emojiSearch from '@/features/emoji/search';
import { useInstance } from '@/hooks/use-instance';
import {
  useRelationshipQuery,
  useUnblockAccountMutation,
} from '@/queries/accounts/use-relationship';
import { useModalsActions } from '@/stores/modals';
import { textAtCursorMatchesToken } from '@/utils/suggestions';

import ChatTextarea from './chat-textarea';

import type { Emoji, NativeEmoji } from '@/features/emoji';
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

const initialSuggestionState = {
  list: [],
  tokenStart: 0,
  token: '',
};

interface Suggestion {
  list: Emoji[];
  tokenStart: number;
  token: string;
}

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

    const isBlocked = relationship?.blocked_by && false;
    const isBlocking = relationship?.blocking && false;

    const maxCharacterCount = useInstance().configuration.chats.max_characters;

    const [suggestions, setSuggestions] = useState<Suggestion>(initialSuggestionState);
    const isSuggestionsAvailable = suggestions.list.length > 0;

    const isOverCharacterLimit = maxCharacterCount && value?.length > maxCharacterCount;
    const isSubmitDisabled =
      disabled || (uploading ?? isOverCharacterLimit) || (value.length === 0 && !attachment);

    const overLimitText = maxCharacterCount ? maxCharacterCount - value?.length : '';

    const renderSuggestionValue = (emoji: any) =>
      `${value.slice(0, suggestions.tokenStart)}${emoji.native} ${value.slice(suggestions.tokenStart + suggestions.token.length)}`;

    const onSelectComboboxOption = (selection: string) => {
      const event = { target: { value: selection } } as React.ChangeEvent<HTMLTextAreaElement>;

      if (onChange) {
        onChange(event);
        setSuggestions(initialSuggestionState);
      }
    };

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const [tokenStart, token] = textAtCursorMatchesToken(
        event.target.value,
        event.target.selectionStart,
        [':'],
      );

      if (token && tokenStart) {
        const results = emojiSearch(token.replace(':', ''), { maxResults: 5 });
        setSuggestions({
          list: results,
          token,
          tokenStart: tokenStart - 1,
        });
      } else {
        setSuggestions(initialSuggestionState);
      }

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
          <Stack space={3} alignItems='center'>
            <Text align='center' theme='muted'>
              <FormattedMessage
                id='chat_message_list.blocked'
                defaultMessage='You blocked this user'
              />
            </Text>

            <Button theme='secondary' onClick={handleUnblockUser}>
              <FormattedMessage id='chat_composer.unblock' defaultMessage='Unblock' />
            </Button>
          </Stack>
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

        <HStack alignItems='stretch' justifyContent='between' space={4}>
          <Stack justifyContent='end' alignItems='center' className='mb-1.5 w-10'>
            <UploadButton
              onSelectFile={onSelectFile}
              resetFileKey={resetFileKey}
              iconClassName='h-5 w-5'
              className='text-primary-500'
              disabled={uploading ?? !!attachment}
            />
          </Stack>

          <Stack grow>
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
                attachment={attachment}
                onDeleteAttachment={onDeleteAttachment}
                uploading={uploading}
                uploadProgress={uploadProgress}
              />
              {isSuggestionsAvailable ? (
                <ComboboxPopover>
                  <ComboboxList>
                    {suggestions.list.map((emojiSuggestion) => (
                      <ComboboxOption
                        key={emojiSuggestion.colons}
                        value={renderSuggestionValue(emojiSuggestion)}
                      >
                        <span>{(emojiSuggestion as NativeEmoji).native}</span>
                        <span className='ml-1'>{emojiSuggestion.colons}</span>
                      </ComboboxOption>
                    ))}
                  </ComboboxList>
                </ComboboxPopover>
              ) : null}
            </Combobox>
          </Stack>

          <Stack space={2} justifyContent='end' alignItems='center' className='mb-1.5 w-10'>
            {isOverCharacterLimit ? (
              <Text size='sm' theme='danger'>
                {overLimitText}
              </Text>
            ) : null}

            <IconButton
              src={require('@phosphor-icons/core/regular/paper-plane-right.svg')}
              iconClassName='h-5 w-5'
              className='text-primary-500'
              disabled={isSubmitDisabled}
              onClick={onSubmit}
              title={intl.formatMessage(messages.send)}
            />
          </Stack>
        </HStack>

        <HStack alignItems='center' className='h-5' space={1}>
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
        </HStack>
      </div>
    );
  },
);

export { ChatComposer as default };
