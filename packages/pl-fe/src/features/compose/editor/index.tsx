/**
 * This source code is derived from code from Meta Platforms, Inc.
 * and affiliates, licensed under the MIT license located in the
 * LICENSE file in the `/src/features/compose/editor` directory.
 */

import { $convertFromMarkdownString, $convertToMarkdownString } from '@lexical/markdown';
import { AutoLinkPlugin, createLinkMatcherWithRegExp } from '@lexical/react/LexicalAutoLinkPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { LexicalComposer, type InitialConfigType } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import clsx from 'clsx';
import { $createParagraphNode, $createTextNode, $getRoot, type EditorState, type LexicalEditor } from 'lexical';
import React, { useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useCompose } from 'pl-fe/hooks/use-compose';

import { useNodes } from './nodes';
import AutosuggestPlugin from './plugins/autosuggest-plugin';
import FloatingBlockTypeToolbarPlugin from './plugins/floating-block-type-toolbar-plugin';
import FloatingLinkEditorPlugin from './plugins/floating-link-editor-plugin';
import FloatingTextFormatToolbarPlugin from './plugins/floating-text-format-toolbar-plugin';
import FocusPlugin from './plugins/focus-plugin';
import RefPlugin from './plugins/ref-plugin';
import StatePlugin from './plugins/state-plugin';
import SubmitPlugin from './plugins/submit-plugin';
import { TRANSFORMERS } from './transformers';

const LINK_MATCHERS = [
  createLinkMatcherWithRegExp(
    /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/i,
    (text) => text.startsWith('http') ? text : `https://${text}`,
  ),
];

const messages = defineMessages({
  placeholder: { id: 'compose_form.placeholder', defaultMessage: 'What\'s on your mind?' },
  eventPlaceholder: { id: 'compose_form.event_placeholder', defaultMessage: 'Post to this event' },
  pollPlaceholder: { id: 'compose_form.poll_placeholder', defaultMessage: 'Add a poll topic…' },
});

interface IComposeEditor {
  className?: string;
  editableClassName?: string;
  placeholderClassName?: string;
  composeId: string;
  condensed?: boolean;
  eventDiscussion?: boolean;
  hasPoll?: boolean;
  autoFocus?: boolean;
  handleSubmit?(): void;
  onPaste?(files: FileList): void;
  onChange?(text: string): void;
  onFocus?: React.FocusEventHandler<HTMLDivElement>;
  placeholder?: string;
}

const theme: InitialConfigType['theme'] = {
  emoji: 'select-none',
  hashtag: 'hover:underline text-primary-600 dark:text-accent-blue hover:text-primary-800 dark:hover:text-accent-blue',
  link: 'hover:underline text-primary-600 dark:text-accent-blue hover:text-primary-800 dark:hover:text-accent-blue',
  text: {
    bold: 'font-bold',
    code: 'font-mono',
    italic: 'italic',
    strikethrough: 'line-through',
    underline: 'underline',
    underlineStrikethrough: 'underline-line-through',
  },
  heading: {
    h1: 'text-2xl font-bold',
    h2: 'text-xl font-bold',
    h3: 'text-lg font-semibold',
  },
};

const ComposeEditor = React.forwardRef<LexicalEditor, IComposeEditor>(({
  className,
  editableClassName,
  placeholderClassName,
  composeId,
  condensed,
  eventDiscussion,
  hasPoll,
  autoFocus,
  handleSubmit,
  onChange,
  onFocus,
  onPaste,
  placeholder,
}, ref) => {
  const dispatch = useAppDispatch();
  const { contentType, modifiedLanguage: language } = useCompose(composeId);
  const isWysiwyg = contentType === 'wysiwyg';
  const nodes = useNodes(isWysiwyg);
  const intl = useIntl();

  const [suggestionsHidden, setSuggestionsHidden] = useState(true);

  const initialConfig = useMemo<InitialConfigType>(() => ({
    namespace: 'ComposeForm',
    onError: console.error,
    nodes,
    theme,
    editorState: dispatch((_, getState) => {
      const state = getState();
      const compose = state.compose[composeId];

      if (!compose) return;

      const editorState = !compose.modifiedLanguage || compose.modifiedLanguage === compose.language
        ? compose.editorState
        : compose.editorStateMap[compose.modifiedLanguage] || '';

      if (editorState) {
        return editorState;
      }
      
      console.log(editorState);

      return () => {
        const text = !compose.modifiedLanguage || compose.modifiedLanguage === compose.language
          ? compose.text
          : compose.textMap[compose.modifiedLanguage] || '';

        if (isWysiwyg) {
          $convertFromMarkdownString(text, TRANSFORMERS);
        } else {
          const paragraph = $createParagraphNode();
          const textNode = $createTextNode(text);

          paragraph.append(textNode);

          $getRoot().clear().append(paragraph);
        }
      };
    }),
  }), [composeId, isWysiwyg]);

  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  const handlePaste: React.ClipboardEventHandler<HTMLDivElement> = (e) => {
    if (onPaste && e.clipboardData && e.clipboardData.files.length === 1) {
      onPaste(e.clipboardData.files);
      e.preventDefault();
    }
  };

  const handleChange = (_: EditorState, editor: LexicalEditor) => {
    if (onChange) {
      editor.update(() => {
        onChange($convertToMarkdownString(TRANSFORMERS));
      });
    }
  };

  let textareaPlaceholder = placeholder || intl.formatMessage(messages.placeholder);

  if (eventDiscussion) {
    textareaPlaceholder = intl.formatMessage(messages.eventPlaceholder);
  } else if (hasPoll) {
    textareaPlaceholder = intl.formatMessage(messages.pollPlaceholder);
  }

  return (
    <LexicalComposer key={isWysiwyg ? 'wysiwyg' : 'no-wysiwyg'} initialConfig={initialConfig}>
      <div className={clsx('lexical relative', className)} data-markup>
        <RichTextPlugin
          contentEditable={
            <div onFocus={onFocus} onPaste={handlePaste} ref={onRef}>
              <ContentEditable
                tabIndex={0}
                className={clsx(
                  'relative z-10 text-[1rem] outline-none transition-[min-height] motion-reduce:transition-none',
                  editableClassName,
                  {
                    'min-h-[39px]': condensed,
                    'min-h-[99px]': !condensed,
                  },
                )}
                lang={language || undefined}
                data-compose-id={composeId}
              />
            </div>
          }
          placeholder={(
            <div
              className={clsx(
                'pointer-events-none absolute top-0 select-none text-[1rem] text-gray-600 dark:placeholder:text-gray-600',
                placeholderClassName,
              )}
            >
              {textareaPlaceholder}
            </div>
          )}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin onChange={handleChange} />
        <HistoryPlugin />
        <HashtagPlugin />
        <AutosuggestPlugin composeId={composeId} suggestionsHidden={suggestionsHidden} setSuggestionsHidden={setSuggestionsHidden} />
        <AutoLinkPlugin matchers={LINK_MATCHERS} />
        {isWysiwyg && <LinkPlugin />}
        {isWysiwyg && <ListPlugin />}
        {isWysiwyg && floatingAnchorElem && (
          <>
            <FloatingBlockTypeToolbarPlugin anchorElem={floatingAnchorElem} />
            <FloatingTextFormatToolbarPlugin anchorElem={floatingAnchorElem} />
            <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
          </>
        )}
        <StatePlugin composeId={composeId} isWysiwyg={isWysiwyg} />
        <SubmitPlugin composeId={composeId} handleSubmit={handleSubmit} />
        <FocusPlugin autoFocus={autoFocus} />
        <ClearEditorPlugin />
        <RefPlugin ref={ref} />
      </div>
    </LexicalComposer>
  );
});

export { ComposeEditor as default };
