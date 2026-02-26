/**
 * This source code is derived from code from Meta Platforms, Inc.
 * and affiliates, licensed under the MIT license located in the
 * LICENSE file in the /src/features/compose/editor directory.
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import clsx from 'clsx';
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_NORMAL,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_TAB_COMMAND,
  type LexicalEditor,
  type LexicalNode,
  type RangeSelection,
  TextNode,
} from 'lexical';
import React, {
  type MutableRefObject,
  type ReactPortal,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import ReactDOM from 'react-dom';

import { saveSettings } from '@/actions/settings';
import AutosuggestEmoji from '@/components/autosuggest-emoji';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useComposeSuggestions } from '@/hooks/use-compose-suggestions';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { useSettingsStoreActions } from '@/stores/settings';
import { textAtCursorMatchesToken } from '@/utils/suggestions';

import AutosuggestAccount from '../../components/autosuggest-account';
import { $createEmojiNode } from '../nodes/emoji-node';
import { $createMentionNode } from '../nodes/mention-node';

import type { AutoSuggestion } from '@/components/autosuggest-input';
import type { Emoji } from '@/features/emoji';

type QueryMatch = {
  leadOffset: number;
  matchingString: string;
};

type Resolution = {
  match: QueryMatch;
  getRect: () => DOMRect;
};

type MenuRenderFn = (
  anchorElementRef: MutableRefObject<HTMLElement | null>,
) => ReactPortal | React.JSX.Element | null;

const tryToPositionRange = (leadOffset: number, range: Range): boolean => {
  const domSelection = window.getSelection();
  if (domSelection === null || !domSelection.isCollapsed) {
    return false;
  }
  const anchorNode = domSelection.anchorNode;
  const startOffset = leadOffset;
  const endOffset = domSelection.anchorOffset;

  if (!anchorNode || !endOffset) {
    return false;
  }

  try {
    range.setStart(anchorNode, startOffset);
    range.setEnd(anchorNode, endOffset);
  } catch (error) {
    return false;
  }

  return true;
};

const isSelectionOnEntityBoundary = (editor: LexicalEditor, offset: number): boolean => {
  if (offset !== 0) {
    return false;
  }
  return editor.getEditorState().read(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchor = selection.anchor;
      const anchorNode = anchor.getNode();
      const prevSibling = anchorNode.getPreviousSibling();
      return $isTextNode(prevSibling) && prevSibling.isTextEntity();
    }
    return false;
  });
};

const startTransition = (callback: () => void) => {
  if (React.startTransition) {
    React.startTransition(callback);
  } else {
    callback();
  }
};

// Got from https://stackoverflow.com/a/42543908/2013580
const getScrollParent = (
  element: HTMLElement,
  includeHidden: boolean,
): HTMLElement | HTMLBodyElement => {
  let style = getComputedStyle(element);
  const excludeStaticParent = style.position === 'absolute';
  const overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/;
  if (style.position === 'fixed') {
    return document.body;
  }
  for (let parent: HTMLElement | null = element; (parent = parent.parentElement); ) {
    style = getComputedStyle(parent);
    if (excludeStaticParent && style.position === 'static') {
      continue;
    }
    if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) {
      return parent;
    }
  }
  return document.body;
};

const isTriggerVisibleInNearestScrollContainer = (
  targetElement: HTMLElement,
  containerElement: HTMLElement,
): boolean => {
  const tRect = targetElement.getBoundingClientRect();
  const cRect = containerElement.getBoundingClientRect();
  return tRect.top > cRect.top && tRect.top < cRect.bottom;
};

// Reposition the menu on scroll, window resize, and element resize.
const useDynamicPositioning = (
  resolution: Resolution | null,
  targetElement: HTMLElement | null,
  onReposition: () => void,
  onVisibilityChange?: (isInView: boolean) => void,
) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (targetElement && resolution) {
      const rootElement = editor.getRootElement();
      const rootScrollParent = rootElement ? getScrollParent(rootElement, false) : document.body;
      let ticking = false;
      let previousIsInView = isTriggerVisibleInNearestScrollContainer(
        targetElement,
        rootScrollParent,
      );
      const handleScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            onReposition();
            ticking = false;
          });
          ticking = true;
        }
        const isInView = isTriggerVisibleInNearestScrollContainer(targetElement, rootScrollParent);
        if (isInView !== previousIsInView) {
          previousIsInView = isInView;
          if (onVisibilityChange) {
            onVisibilityChange(isInView);
          }
        }
      };
      const resizeObserver = new ResizeObserver(onReposition);
      window.addEventListener('resize', onReposition);
      document.addEventListener('scroll', handleScroll, {
        capture: true,
        passive: true,
      });
      resizeObserver.observe(targetElement);
      return () => {
        resizeObserver.unobserve(targetElement);
        window.removeEventListener('resize', onReposition);
        document.removeEventListener('scroll', handleScroll);
      };
    }
  }, [targetElement, editor, onVisibilityChange, onReposition, resolution]);
};

const LexicalPopoverMenu = ({
  anchorElementRef,
  menuRenderFn,
}: {
  anchorElementRef: MutableRefObject<HTMLElement>;
  menuRenderFn: MenuRenderFn;
}): React.JSX.Element | null => menuRenderFn(anchorElementRef);

const useMenuAnchorRef = (
  resolution: Resolution | null,
  setResolution: (r: Resolution | null) => void,
): MutableRefObject<HTMLElement> => {
  const [editor] = useLexicalComposerContext();
  const anchorElementRef = useRef<HTMLElement>(document.createElement('div'));
  const positionMenu = useCallback(() => {
    const rootElement = editor.getRootElement();
    const containerDiv = anchorElementRef.current;

    if (rootElement !== null && resolution !== null) {
      const { left, top, width, height } = resolution.getRect();
      containerDiv.style.top = `${top + window.scrollY}px`;
      containerDiv.style.left = `${left + window.scrollX}px`;
      containerDiv.style.height = `${height}px`;
      containerDiv.style.width = `${width}px`;

      if (!containerDiv.isConnected) {
        containerDiv.setAttribute('aria-label', 'Typeahead menu');
        containerDiv.setAttribute('id', 'typeahead-menu');
        containerDiv.setAttribute('role', 'listbox');
        containerDiv.style.display = 'block';
        containerDiv.style.position = 'absolute';
        document.body.append(containerDiv);
      }
      anchorElementRef.current = containerDiv;
      rootElement.setAttribute('aria-controls', 'typeahead-menu');
    }
  }, [editor, resolution]);

  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (resolution !== null) {
      positionMenu();
      return () => {
        if (rootElement !== null) {
          rootElement.removeAttribute('aria-controls');
        }

        const containerDiv = anchorElementRef.current;
        if (containerDiv !== null && containerDiv.isConnected) {
          containerDiv.remove();
        }
      };
    }
  }, [editor, positionMenu, resolution]);

  const onVisibilityChange = useCallback(
    (isInView: boolean) => {
      if (resolution !== null) {
        if (!isInView) {
          setResolution(null);
        }
      }
    },
    [resolution, setResolution],
  );

  useDynamicPositioning(resolution, anchorElementRef.current, positionMenu, onVisibilityChange);

  return anchorElementRef;
};

type AutosuggestPluginProps = {
  suggestionsHidden: boolean;
  setSuggestionsHidden: (value: boolean) => void;
};

const AutosuggestPlugin = ({
  suggestionsHidden,
  setSuggestionsHidden,
}: AutosuggestPluginProps): React.JSX.Element | null => {
  const { rememberEmojiUse } = useSettingsStoreActions();
  const dispatch = useAppDispatch();

  const [editor] = useLexicalComposerContext();
  const [resolution, setResolution] = useState<Resolution | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [token, setToken] = useState('');
  const suggestions = useComposeSuggestions(token);
  const anchorElementRef = useMenuAnchorRef(resolution, setResolution);

  const handleSelectSuggestion: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const index = Number(e.currentTarget.getAttribute('data-index'));
    onSelectSuggestion(index);
  };

  const onSelectSuggestion = (index: number) => {
    const suggestion = suggestions[index];

    editor.update(() => {
      const state = editor.getEditorState();
      const node = (state._selection as RangeSelection)?.anchor?.getNode();
      const { leadOffset, matchingString } = resolution!.match;
      /** Offset for the beginning of the matched text, including the token. */
      const offset = leadOffset - 1;

      /** Replace the matched text with the given node. */
      const replaceMatch = (replaceWith: LexicalNode) => {
        const result = (node as TextNode).splitText(offset, offset + matchingString.length);
        const textNode = result[1] ?? result[0];
        const replacedNode = textNode.replace(replaceWith);
        replacedNode.insertAfter(new TextNode(' '));
        replacedNode.selectNext();
      };

      if (typeof suggestion === 'object' && 'id' in suggestion) {
        if (!suggestion.id) return;

        rememberEmojiUse(suggestion as Emoji);
        dispatch(saveSettings());

        replaceMatch($createEmojiNode(suggestion as Emoji));
      } else if (typeof suggestion === 'string') {
        if (suggestion[0] === '#') {
          (node as TextNode).setTextContent(`${suggestion} `);
          node.select();
        } else {
          const account = queryClient.getQueryData(queryKeys.accounts.show(suggestion));
          if (account) replaceMatch($createMentionNode(account));
        }
      }

      setToken('');
    });
  };

  const getQueryTextForSearch = (editor: LexicalEditor) => {
    const state = editor.getEditorState();
    const node = (state._selection as RangeSelection)?.anchor?.getNode();

    if (!node) return null;

    if (node.getType() === 'text') {
      const [leadOffset, matchingString] = textAtCursorMatchesToken(
        node.getTextContent(),
        (state._selection as RangeSelection)?.anchor?.offset,
        [':', '@'],
      );

      if (!leadOffset || !matchingString) return null;
      return { leadOffset, matchingString };
    }

    return null;
  };

  const renderSuggestion = (suggestion: AutoSuggestion, i: number) => {
    let inner: string | React.JSX.Element;
    let key: React.Key;

    if (typeof suggestion === 'object' && 'id' in suggestion) {
      inner = <AutosuggestEmoji emoji={suggestion as Emoji} />;
      key = suggestion.id;
    } else if (typeof suggestion === 'string') {
      if (suggestion[0] === '#') {
        inner = suggestion;
        key = suggestion;
      } else {
        inner = <AutosuggestAccount id={suggestion} />;
        key = suggestion;
      }
    } else {
      return null;
    }

    return (
      <div
        role='button'
        tabIndex={0}
        key={key}
        data-index={i}
        className={clsx({
          'group snap-start snap-always px-4 py-2.5 text-sm text-gray-700 focus:bg-gray-100 dark:text-gray-500 dark:focus:bg-primary-800': true,
          'hover:bg-gray-100 dark:hover:bg-gray-800': i !== selectedSuggestion,
          'bg-gray-100 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-800':
            i === selectedSuggestion,
        })}
        onMouseDown={handleSelectSuggestion}
      >
        {inner}
      </div>
    );
  };

  const closeTypeahead = useCallback(() => {
    setResolution(null);
  }, [resolution]);

  const openTypeahead = useCallback(
    (res: Resolution) => {
      setResolution(res);
    },
    [resolution],
  );

  useEffect(() => {
    const updateListener = () => {
      editor.getEditorState().read(() => {
        const range = document.createRange();
        const match = getQueryTextForSearch(editor);
        const nativeSelection = window.getSelection();

        if (!match || nativeSelection?.anchorOffset !== nativeSelection?.focusOffset) {
          closeTypeahead();
          return;
        }

        setToken(match.matchingString.trim());

        if (!isSelectionOnEntityBoundary(editor, match.leadOffset)) {
          const isRangePositioned = tryToPositionRange(match.leadOffset, range);
          if (isRangePositioned !== null) {
            startTransition(() => {
              openTypeahead({
                getRect: () => range.getBoundingClientRect(),
                match,
              });
            });
            return;
          }
        }
        closeTypeahead();
      });
    };

    const removeUpdateListener = editor.registerUpdateListener(updateListener);

    return () => {
      removeUpdateListener();
    };
  }, [editor, resolution, closeTypeahead, openTypeahead]);

  useEffect(() => {
    if (suggestions && suggestions.length > 0) setSuggestionsHidden(false);
  }, [suggestions]);

  useEffect(() => {
    if (resolution !== null && !suggestionsHidden && suggestions.length) {
      const handleClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;

        if (!editor._rootElement?.contains(target) && !anchorElementRef.current.contains(target)) {
          setResolution(null);
        }
      };
      document.addEventListener('click', handleClick);

      return () => {
        document.removeEventListener('click', handleClick);
      };
    }
  }, [resolution, suggestionsHidden, !suggestions.length]);

  useEffect(() => {
    if (resolution === null) return;

    return mergeRegister(
      editor.registerCommand<KeyboardEvent>(
        KEY_ARROW_UP_COMMAND,
        (payload) => {
          const event = payload;
          if (suggestions !== null && suggestions.length && selectedSuggestion !== null) {
            const newSelectedSuggestion =
              selectedSuggestion !== 0 ? selectedSuggestion - 1 : suggestions.length - 1;
            setSelectedSuggestion(newSelectedSuggestion);
            event.preventDefault();
            event.stopImmediatePropagation();
          }
          return true;
        },
        COMMAND_PRIORITY_NORMAL,
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_ARROW_DOWN_COMMAND,
        (payload) => {
          const event = payload;
          if (suggestions !== null && suggestions.length && selectedSuggestion !== null) {
            const newSelectedSuggestion =
              selectedSuggestion !== suggestions.length - 1 ? selectedSuggestion + 1 : 0;
            setSelectedSuggestion(newSelectedSuggestion);
            event.preventDefault();
            event.stopImmediatePropagation();
          }
          return true;
        },
        COMMAND_PRIORITY_NORMAL,
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_TAB_COMMAND,
        (payload) => {
          const event = payload;
          event.preventDefault();
          event.stopImmediatePropagation();
          onSelectSuggestion(selectedSuggestion);
          setResolution(null);
          return true;
        },
        COMMAND_PRIORITY_NORMAL,
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_ENTER_COMMAND,
        (payload) => {
          const event = payload;
          event.preventDefault();
          event.stopImmediatePropagation();
          onSelectSuggestion(selectedSuggestion);
          setResolution(null);
          return true;
        },
        COMMAND_PRIORITY_NORMAL,
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_ESCAPE_COMMAND,
        (payload) => {
          const event = payload;
          event.preventDefault();
          event.stopImmediatePropagation();
          setResolution(null);
          return true;
        },
        COMMAND_PRIORITY_NORMAL,
      ),
    );
  }, [editor, suggestions, selectedSuggestion, resolution]);

  return resolution === null || editor === null ? null : (
    <LexicalPopoverMenu
      anchorElementRef={anchorElementRef}
      menuRenderFn={(anchorElementRef) =>
        anchorElementRef.current
          ? ReactDOM.createPortal(
              <div
                className={clsx({
                  'relative z-[1000] mt-6 max-h-56 w-max snap-y snap-always space-y-0 overflow-y-auto scroll-smooth rounded-lg bg-white py-1 shadow will-change-scroll focus:outline-none dark:bg-gray-900 dark:ring-2 dark:ring-primary-700': true,
                  hidden: suggestionsHidden || !suggestions.length,
                  block: !suggestionsHidden && suggestions.length,
                })}
              >
                {suggestions.map(renderSuggestion)}
              </div>,
              anchorElementRef.current,
            )
          : null
      }
    />
  );
};

export { AutosuggestPlugin as default };
