import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import React, { useEffect } from 'react';

import type { LexicalEditor } from 'lexical';

/** Set the ref to the current Lexical editor instance. */
const RefPlugin = React.forwardRef<LexicalEditor>((_props, ref) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (ref && typeof ref !== 'function') {
      ref.current = editor;
    }
  }, [editor]);

  return null;
});

export { RefPlugin as default };
