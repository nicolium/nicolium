import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { COMMAND_PRIORITY_NORMAL, createCommand, type LexicalCommand } from 'lexical';
import { useEffect } from 'react';

import { FOCUS_EDITOR_EVENT } from '../focus-event';

interface IFocusPlugin {
  autoFocus?: boolean;
}

const FOCUS_EDITOR_COMMAND: LexicalCommand<void> = createCommand();

const FocusPlugin: React.FC<IFocusPlugin> = ({ autoFocus }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() =>
    editor.registerCommand(
      FOCUS_EDITOR_COMMAND,
      () => {
        editor.focus(
          () => {
            const activeElement = document.activeElement;
            const rootElement = editor.getRootElement();
            if (
              rootElement !== null &&
              (activeElement === null || !rootElement.contains(activeElement))
            ) {
              rootElement.focus({ preventScroll: true });
            }
          },
          { defaultSelection: 'rootEnd' },
        );
        return true;
      },
      COMMAND_PRIORITY_NORMAL,
    ),
  );

  useEffect(() => {
    const handleFocusEvent = () => editor.dispatchCommand(FOCUS_EDITOR_COMMAND, undefined);

    return editor.registerRootListener((rootElement, prevRootElement) => {
      prevRootElement?.removeEventListener(FOCUS_EDITOR_EVENT, handleFocusEvent);
      rootElement?.addEventListener(FOCUS_EDITOR_EVENT, handleFocusEvent);
    });
  }, [editor]);

  useEffect(() => {
    if (autoFocus) {
      editor.dispatchCommand(FOCUS_EDITOR_COMMAND, undefined);
    }
  }, [autoFocus, editor]);

  return null;
};

export { FOCUS_EDITOR_COMMAND, FocusPlugin as default };
