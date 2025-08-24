import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { CAN_USE_BEFORE_INPUT, IS_APPLE_WEBKIT, IS_IOS, IS_SAFARI } from '@lexical/utils';
import { $getSelection, $isRangeSelection, INSERT_LINE_BREAK_COMMAND, INSERT_PARAGRAPH_COMMAND, KEY_ENTER_COMMAND } from 'lexical';
import { useEffect } from 'react';

interface ISubmitPlugin {
  composeId: string;
  handleSubmit?: () => void;
}

const SubmitPlugin: React.FC<ISubmitPlugin> = ({ composeId, handleSubmit }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Adapted from https://github.com/facebook/lexical/blob/main/packages/lexical-rich-text/src/index.ts#L929
    return editor.registerCommand(KEY_ENTER_COMMAND, (event) => {
      if (handleSubmit && event?.ctrlKey && !event.shiftKey) {
        handleSubmit();
        return true;
      }

      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        return false;
      }

      if (event !== null) {
        if ((IS_IOS || IS_SAFARI || IS_APPLE_WEBKIT) && CAN_USE_BEFORE_INPUT) {
          return false;
        }
        event.preventDefault();
        if (event.ctrlKey && event.shiftKey) {
          return editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
        }
      }
      return editor.dispatchCommand(INSERT_LINE_BREAK_COMMAND, false);
    }, 1);
  }, [handleSubmit]);

  return null;
};

export { SubmitPlugin as default };
