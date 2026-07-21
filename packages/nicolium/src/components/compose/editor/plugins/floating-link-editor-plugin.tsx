/**
 * This source code is derived from code from Meta Platforms, Inc.
 * and affiliates, licensed under the MIT license located in the
 * LICENSE file in the /src/features/compose/editor directory.
 */

import { $isAutoLinkNode, $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import iconPencilSimple from '@phosphor-icons/core/regular/pencil-simple.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import {
  type BaseSelection,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_LOW,
  type LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { defineMessages, useIntl } from 'react-intl';

import Icon from '@/components/ui/icon';

import { getSelectedNode } from '../utils/get-selected-node';
import { setFloatingElemPosition } from '../utils/set-floating-elem-position';
import { sanitizeUrl } from '../utils/url';

const messages = defineMessages({
  editLink: { id: 'compose_form.lexical.edit_link', defaultMessage: 'Edit link' },
  removeLink: { id: 'compose_form.lexical.remove_link', defaultMessage: 'Remove link' },
});

const FloatingLinkEditor = ({
  editor,
  anchorElem,
}: {
  editor: LexicalEditor;
  anchorElem: HTMLElement;
}): React.JSX.Element => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [isEditMode, setEditMode] = useState(false);
  const [lastSelection, setLastSelection] = useState<BaseSelection | null>(null);

  const intl = useIntl();

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent)) {
        setLinkUrl(parent.getURL());
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL());
      } else {
        setLinkUrl('');
      }
    }
    const editorElem = editorRef.current;
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;

    if (editorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();

    if (
      selection !== null &&
      nativeSelection !== null &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const domRange = nativeSelection.getRangeAt(0);
      let rect;
      if (nativeSelection.anchorNode === rootElement) {
        let inner = rootElement;
        while (inner.firstElementChild !== null) {
          inner = inner.firstElementChild as HTMLElement;
        }
        rect = inner.getBoundingClientRect();
      } else {
        rect = domRange.getBoundingClientRect();
      }

      setFloatingElemPosition(rect, editorElem, anchorElem);
      setLastSelection(selection);
    } else if (!activeElement || activeElement.className !== 'link-input') {
      if (rootElement !== null) {
        setFloatingElemPosition(null, editorElem, anchorElem);
      }
      setLastSelection(null);
      setEditMode(false);
      setLinkUrl('');
    }

    return true;
  }, [anchorElem, editor]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        updateLinkEditor();
      });
    };

    window.addEventListener('resize', update);

    if (scrollerElem) {
      scrollerElem.addEventListener('scroll', update);
    }

    return () => {
      window.removeEventListener('resize', update);

      if (scrollerElem) {
        scrollerElem.removeEventListener('scroll', update);
      }
    };
  }, [anchorElem.parentElement, editor, updateLinkEditor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLinkEditor();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateLinkEditor();
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor();
    });
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditMode]);

  return (
    <div ref={editorRef} className='compose-editor__link-editor'>
      <div className='compose-editor__link-editor__field'>
        {isEditMode ? (
          <>
            <input
              className='compose-editor__link-editor__input'
              ref={inputRef}
              value={linkUrl}
              onChange={(event) => {
                setLinkUrl(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  if (lastSelection !== null) {
                    if (linkUrl !== '') {
                      editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl(linkUrl));
                    } else {
                      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
                    }
                    setEditMode(false);
                  }
                } else if (event.key === 'Escape') {
                  event.preventDefault();
                  setEditMode(false);
                }
              }}
            />
            <div
              className='compose-editor__link-editor__action'
              role='button'
              tabIndex={0}
              aria-label={intl.formatMessage(messages.removeLink)}
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              onClick={() => {
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
                }
              }}
            >
              <Icon className='compose-editor__link-editor__action-icon' src={iconX} aria-hidden />
            </div>
          </>
        ) : (
          <>
            <a
              className='compose-editor__link-editor__url'
              href={linkUrl}
              target='_blank'
              rel='noopener noreferrer'
            >
              {linkUrl}
            </a>
            <div
              className='compose-editor__link-editor__action'
              role='button'
              tabIndex={0}
              aria-label={intl.formatMessage(messages.editLink)}
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              onClick={() => {
                setEditMode(true);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setEditMode(true);
                }
              }}
            >
              <Icon
                className='compose-editor__link-editor__action-icon'
                src={iconPencilSimple}
                aria-hidden
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const useFloatingLinkEditorToolbar = (
  editor: LexicalEditor,
  anchorElem: HTMLElement,
): React.JSX.Element | null => {
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLink, setIsLink] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const linkParent = $findMatchingParent(node, $isLinkNode);
      const autoLinkParent = $findMatchingParent(node, $isAutoLinkNode);

      // We don't want this menu to open for auto links.
      if (linkParent !== null && autoLinkParent === null) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
    }
  }, []);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, updateToolbar]);

  return isLink
    ? createPortal(<FloatingLinkEditor editor={activeEditor} anchorElem={anchorElem} />, anchorElem)
    : null;
};

const FloatingLinkEditorPlugin = ({
  anchorElem = document.body,
}: {
  anchorElem?: HTMLElement;
}): React.JSX.Element | null => {
  const [editor] = useLexicalComposerContext();
  return useFloatingLinkEditorToolbar(editor, anchorElem);
};

export default FloatingLinkEditorPlugin;
