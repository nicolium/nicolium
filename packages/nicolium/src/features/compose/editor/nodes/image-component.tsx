/**
 * This source code is derived from code from Meta Platforms, Inc.
 * and affiliates, licensed under the MIT license located in the
 * LICENSE file in the /src/features/compose/editor directory.
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import iconMagnifyingGlassPlus from '@phosphor-icons/core/regular/magnifying-glass-plus.svg';
import iconWarning from '@phosphor-icons/core/regular/warning.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import clsx from 'clsx';
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  DRAGSTART_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { mediaAttachmentSchema } from 'pl-api';
import * as React from 'react';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import * as v from 'valibot';

import Icon from '@/components/ui/icon';
import IconButton from '@/components/ui/icon-button';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';

import { $isImageNode } from './image-node';

import type { BaseSelection, LexicalEditor, NodeKey } from 'lexical';

const messages = defineMessages({
  description: {
    id: 'upload_form.description',
    defaultMessage: 'Describe for the visually impaired',
  },
  descriptionMissingTitle: {
    id: 'upload_form.description_missing.title',
    defaultMessage: 'This attachment doesn’t have a description',
  },
  preview: { id: 'upload_form.preview', defaultMessage: 'Preview' },
  delete: { id: 'upload_form.undo', defaultMessage: 'Delete' },
});

const imageCache = new Set();

const useSuspenseImage = (src: string) => {
  if (!imageCache.has(src)) {
    throw new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imageCache.add(src);
        resolve(null);
      };
    });
  }
};

const LazyImage = ({
  altText,
  className,
  imageRef,
  src,
}: {
  altText: string;
  className?: string;
  imageRef: { current: null | HTMLImageElement };
  src: string;
}): React.JSX.Element => {
  useSuspenseImage(src);
  return (
    <img
      className={className ?? undefined}
      src={src}
      alt={altText}
      ref={imageRef}
      draggable='false'
    />
  );
};

const ImageComponent = ({
  src,
  altText,
  nodeKey,
}: {
  altText: string;
  nodeKey: NodeKey;
  src: string;
}): React.JSX.Element => {
  const intl = useIntl();
  const { openModal } = useModalsActions();
  const { missingDescriptionModal } = useSettings();

  const imageRef = useRef<null | HTMLImageElement>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [editor] = useLexicalComposerContext();
  const [selection, setSelection] = useState<BaseSelection | null>(null);
  const activeEditorRef = useRef<LexicalEditor | null>(null);

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dirtyDescription, setDirtyDescription] = useState<string | null>(null);

  const deleteNode = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.remove();
      }
    });
  }, [nodeKey]);

  const previewImage = () => {
    const image = v.parse(mediaAttachmentSchema, {
      id: '',
      type: 'image',
      url: src,
      altText,
    });

    openModal('MEDIA', { media: [image], index: 0 });
  };

  const onDelete = useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        const event: KeyboardEvent = payload;
        event.preventDefault();
        deleteNode();
      }
      return false;
    },
    [isSelected, nodeKey],
  );

  const onEnter = useCallback(
    (event: KeyboardEvent) => {
      const latestSelection = $getSelection();
      const buttonElem = buttonRef.current;
      if (
        isSelected &&
        $isNodeSelection(latestSelection) &&
        latestSelection.getNodes().length === 1
      ) {
        if (buttonElem !== null && buttonElem !== document.activeElement) {
          event.preventDefault();
          buttonElem.focus();
          return true;
        }
      }
      return false;
    },
    [isSelected],
  );

  const onEscape = useCallback(
    (event: KeyboardEvent) => {
      if (buttonRef.current === event.target) {
        $setSelection(null);
        editor.update(() => {
          setSelected(true);
          const parentRootElement = editor.getRootElement();
          if (parentRootElement !== null) {
            parentRootElement.focus();
          }
        });
        return true;
      }
      return false;
    },
    [editor, setSelected],
  );

  const handleKeyDown: React.KeyboardEventHandler = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleInputBlur();
    }
  };

  const handleInputBlur = () => {
    setFocused(false);

    if (dirtyDescription !== null) {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          node.setAltText(dirtyDescription);
        }

        setDirtyDescription(null);
      });
    }
  };

  const handleInputChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setDirtyDescription(e.target.value);
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  const handleInputFocus = () => {
    setFocused(true);
  };

  const handleClick = () => {
    setFocused(true);
  };

  useEffect(() => {
    let isMounted = true;
    const unregister = mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        if (isMounted) {
          setSelection(editorState.read(() => $getSelection()));
        }
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_, activeEditor) => {
          activeEditorRef.current = activeEditor;
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        (payload) => {
          const event = payload;

          if (event.target === imageRef.current) {
            if (event.shiftKey) {
              setSelected(!isSelected);
            } else {
              clearSelection();
              setSelected(true);
            }
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        DRAGSTART_COMMAND,
        (event) => {
          if (event.target === imageRef.current) {
            // TODO This is just a temporary workaround for FF to behave like other browsers.
            // Ideally, this handles drag & drop too (and all browsers).
            event.preventDefault();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ENTER_COMMAND, onEnter, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ESCAPE_COMMAND, onEscape, COMMAND_PRIORITY_LOW),
    );
    return () => {
      isMounted = false;
      unregister();
    };
  }, [clearSelection, editor, isSelected, nodeKey, onDelete, onEnter, onEscape, setSelected]);

  const active = hovered || focused;
  const description = (dirtyDescription ?? (dirtyDescription !== '' && altText)) || '';
  const draggable = isSelected && $isNodeSelection(selection);

  return (
    <Suspense fallback={null}>
      <div
        className={clsx('compose-editor__image', {
          'compose-editor__image--selected': isSelected,
          'compose-editor__image--draggable': isSelected && $isNodeSelection(selection),
        })}
        draggable={draggable}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        role='button'
      >
        <div className='compose-editor__image__actions'>
          <IconButton
            onClick={previewImage}
            src={iconMagnifyingGlassPlus}
            theme='dark'
            iconClassName='h-5 w-5'
            title={intl.formatMessage(messages.preview)}
          />
          <IconButton
            onClick={deleteNode}
            src={iconX}
            theme='dark'
            iconClassName='h-5 w-5'
            title={intl.formatMessage(messages.delete)}
          />
        </div>

        <div
          className={clsx('compose-editor__image__description', {
            'compose-editor__image__description--active': active,
          })}
        >
          <label>
            <span className='sr-only'>
              <FormattedMessage
                id='upload_form.description'
                defaultMessage='Describe for the visually impaired'
              />
            </span>

            <textarea
              className='compose-editor__image__alt-input'
              placeholder={intl.formatMessage(messages.description)}
              value={description}
              onFocus={handleInputFocus}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
            />
          </label>
        </div>

        {missingDescriptionModal && !description && (
          <span
            title={intl.formatMessage(messages.descriptionMissingTitle)}
            className={clsx('compose-editor__image__missing-alt', {
              'compose-editor__image__missing-alt--hidden': active,
            })}
          >
            <Icon src={iconWarning} />
            <FormattedMessage id='upload_form.description_missing.indicator' defaultMessage='Alt' />
          </span>
        )}

        <LazyImage src={src} altText={altText} imageRef={imageRef} />
      </div>
    </Suspense>
  );
};

export default ImageComponent;
