import clsx from 'clsx';
import React, { useImperativeHandle, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import AutosuggestInput from '@/components/autosuggest-input';
import Textarea from '@/components/ui/textarea';
import { isNativeEmoji } from '@/features/emoji';
import { useComposeSuggestions } from '@/hooks/use-compose-suggestions';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { selectAccount } from '@/queries/accounts/selectors';
import { useCompose, useComposeActions } from '@/stores/compose';

import type { AutoSuggestion } from '@/components/autosuggest-input';
import type { Emoji } from '@/features/emoji';

const messages = defineMessages({
  placeholder: { id: 'compose_form.placeholder', defaultMessage: 'What’s on your mind?' },
  eventPlaceholder: { id: 'compose_form.event.placeholder', defaultMessage: 'Post to this event' },
  pollPlaceholder: { id: 'compose_form.poll.placeholder', defaultMessage: 'Add a poll topic…' },
});

interface PlainTextEditorHandle {
  focus(): void;
  clear(): void;
  insertEmoji(emoji: Emoji): void;
}

interface IPlainTextEditor {
  className?: string;
  composeId: string;
  condensed?: boolean;
  eventDiscussion?: boolean;
  hasPoll?: boolean;
  autoFocus?: boolean;
  handleSubmit?(): void;
  onPaste?(files: FileList): void;
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
}

const getSuggestionCompletion = (suggestion: AutoSuggestion, scopeUrl: string): string => {
  if (typeof suggestion === 'object' && 'id' in suggestion) {
    return isNativeEmoji(suggestion) ? suggestion.native : suggestion.colons;
  }

  if (typeof suggestion === 'string' && suggestion[0] === '#') {
    return suggestion;
  }

  if (typeof suggestion === 'string') {
    return selectAccount(suggestion, scopeUrl)?.acct ?? suggestion;
  }

  return '';
};

const PlainTextEditor = React.forwardRef<PlainTextEditorHandle, IPlainTextEditor>(
  (
    {
      className,
      composeId,
      condensed,
      eventDiscussion,
      hasPoll,
      autoFocus,
      handleSubmit,
      onPaste,
      onFocus,
      placeholder,
    },
    ref,
  ) => {
    const intl = useIntl();
    const { updateCompose } = useComposeActions();
    const { language, modifiedLanguage, text, textMap } = useCompose(composeId);

    const [token, setToken] = useState('');
    const suggestions = useComposeSuggestions(token);
    const scopeUrl = useScopeUrl();

    const inputRef = useRef<HTMLTextAreaElement>(null);

    const usesBaseLanguage = !modifiedLanguage || modifiedLanguage === language;
    const value = usesBaseLanguage ? text : textMap[modifiedLanguage!] || '';

    const setText = (nextValue: string) => {
      updateCompose(composeId, (draft) => {
        if (!draft.modifiedLanguage || draft.modifiedLanguage === draft.language) {
          draft.text = nextValue;
          draft.editorState = nextValue ? draft.editorState : null;
        } else {
          draft.textMap[draft.modifiedLanguage] = nextValue;
        }
      });
    };

    const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
      setText(e.target.value);
    };

    const onSuggestionsFetchRequested = (token: string) => setToken(token);
    const onSuggestionsClearRequested = () => setToken('');

    const onSuggestionSelected = (
      tokenStart: number,
      token: string | null,
      suggestion: AutoSuggestion,
    ) => {
      if (!token) return;

      const completion = getSuggestionCompletion(suggestion, scopeUrl);
      setText(
        `${value.slice(0, tokenStart)}${completion} ${value.slice(tokenStart + token.length)}`,
      );
    };

    const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        handleSubmit?.();
      }
    };

    const handlePaste: React.ClipboardEventHandler<HTMLTextAreaElement> = (e) => {
      if (onPaste && e.clipboardData && e.clipboardData.files.length === 1) {
        onPaste(e.clipboardData.files);
        e.preventDefault();
      }
    };

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      clear: () => setText(''),
      insertEmoji: (emoji) => {
        const input = inputRef.current;
        const completion = `${isNativeEmoji(emoji) ? emoji.native : emoji.colons} `;
        const caret = input?.selectionStart ?? value.length;
        setText(`${value.slice(0, caret)}${completion}${value.slice(caret)}`);
      },
    }));

    let textareaPlaceholder = placeholder ?? intl.formatMessage(messages.placeholder);

    if (eventDiscussion) {
      textareaPlaceholder = intl.formatMessage(messages.eventPlaceholder);
    } else if (hasPoll) {
      textareaPlaceholder = intl.formatMessage(messages.pollPlaceholder);
    }

    return (
      <div className={className}>
        <AutosuggestInput
          ref={inputRef}
          as={Textarea}
          value={value}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          suggestions={suggestions}
          onSuggestionsFetchRequested={onSuggestionsFetchRequested}
          onSuggestionsClearRequested={onSuggestionsClearRequested}
          onSuggestionSelected={onSuggestionSelected}
          placeholder={textareaPlaceholder}
          autoFocus={autoFocus}
          theme='transparent'
          searchTokens={['@', ':', '#']}
          lang={modifiedLanguage ?? undefined}
          className={clsx('compose-form__editor__editable', {
            'compose-form__editor__editable--condensed': condensed,
          })}
          inputProps={{
            autoGrow: true,
            isResizeable: false,
            onPaste: handlePaste,
            'data-compose-id': composeId,
          }}
        />
      </div>
    );
  },
);

PlainTextEditor.displayName = 'PlainTextEditor';

export { type PlainTextEditorHandle, PlainTextEditor as default };
