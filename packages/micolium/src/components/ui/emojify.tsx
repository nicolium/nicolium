import { Image } from 'expo-image';
import React from 'react';

import nyaize from '@/queries/utils/nyaize';
import { makeEmojiMap } from '@/utils/emojis';

import type { CustomEmoji } from 'pl-api';

const validEmojiChar = (c: string) => /^[a-zA-Z0-9_.-]$/.test(c);

interface IEmojify {
  text: string;
  emojis: Array<CustomEmoji>;
  nyaize?: boolean;
}

const Emojify: React.FC<IEmojify> = React.memo(({ text, emojis, nyaize: shouldNyaize }) => {
  if (!emojis?.length) return shouldNyaize ? nyaize(text) : text;

  const emojiMap = makeEmojiMap(emojis || []);

  const nodes: Array<string | React.JSX.Element> = [];
  let replaced = false;

  let currentText = '';
  let stack = '';
  let open = false;

  const clearStack = () => {
    if (stack.length) currentText += stack;
    open = false;
    stack = '';
  };

  for (const i in Array.from(text)) {
    const c = text[i];

    if (c === ':') {
      if (!open) {
        clearStack();
      }

      stack += c;

      // we see another : we convert it and clear the stack buffer
      if (open) {
        const emoji = stack.length >= 3 ? emojiMap[stack] : undefined;

        if (emoji?.static_url) {
          if (currentText.length) nodes.push(currentText);
          currentText = '';
          nodes.push(
            <Image
              key={i}
              source={{ uri: emoji.url }}
              accessibilityLabel={emoji.shortcode}
              style={{ width: 16, height: 16, objectFit: 'contain', display: 'inline-block' }}
            />,
          );
          replaced = true;
        } else {
          currentText += stack;
        }
        stack = '';
      }

      open = !open;
    } else {
      stack += c;

      if (open && !validEmojiChar(c)) {
        clearStack();
      }
    }
  }

  if (!replaced) return text;

  if (stack.length) currentText += stack;
  if (currentText.length) nodes.push(shouldNyaize ? nyaize(currentText) : currentText);
  currentText = '';

  return <>{nodes}</>;
});

Emojify.displayName = 'Emojify';

export { validEmojiChar, Emojify };
