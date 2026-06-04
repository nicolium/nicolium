import React from 'react';

import Emoji from '@/components/ui/emoji';
import { useSettings } from '@/stores/settings';
import { makeEmojiMap } from '@/utils/normalizers';
import nyaize from '@/utils/nyaize';
import { joinPublicPath } from '@/utils/static';

import unicodeMapping from './mapping';

import { validEmojiChar } from '.';

import type { CustomEmoji } from 'pl-api';

const segmenter = new Intl.Segmenter();

interface IMaybeEmoji {
  text: string;
  emojis: Record<string, CustomEmoji>;
  nyaize: boolean;
  truncated: boolean;
}

const MaybeEmoji: React.FC<IMaybeEmoji> = ({ text, emojis, nyaize: shouldNyaize, truncated }) => {
  if (text.length < 3) return text;
  if (text in emojis) {
    const emoji = emojis[text];
    const filename = emoji.static_url;

    if (filename?.length > 0) {
      const emoji = <Emoji className='emojione emoji' emoji={text} src={filename} />;
      if (truncated) {
        return <span className='emoji__container'>{emoji}</span>;
      } else {
        return emoji;
      }
    }
  }

  return shouldNyaize ? nyaize(text) : text;
};

interface IEmojify {
  text: string;
  emojis?: Array<CustomEmoji> | Record<string, CustomEmoji>;
  nyaize?: boolean;
  truncated?: boolean;
}

const Emojify: React.FC<IEmojify> = React.memo(
  ({ text, emojis = {}, nyaize: shouldNyaize = false, truncated = false }) => {
    const { disableUserProvidedMedia, systemEmojiFont } = useSettings();

    if (Array.isArray(emojis)) emojis = makeEmojiMap(emojis);

    const nodes = [];

    let stack = '';
    let open = false;

    const clearStack = () => {
      if (stack.length) nodes.push(shouldNyaize ? nyaize(stack) : stack);
      open = false;
      stack = '';
    };

    const splitText = segmenter.segment(text || '');

    for (let { segment: c, index } of splitText) {
      // convert FE0E selector to FE0F so it can be found in unimap
      if (c.codePointAt(c.length - 1) === 65038) {
        c = c.slice(0, -1) + String.fromCodePoint(65039);
      }

      // unqualified emojis aren't in emoji-mart's mappings so we just add FEOF
      const unqualified = c + String.fromCodePoint(65039);

      if (!systemEmojiFont && c in unicodeMapping) {
        clearStack();

        const { unified, shortcode } = unicodeMapping[c];

        const emoji = (
          <img
            key={index}
            draggable={false}
            className='emojione emoji'
            alt={c}
            title={`:${shortcode}:`}
            src={joinPublicPath(`packs/emoji/${unified}.svg`)}
          />
        );

        if (truncated) {
          nodes.push(
            <span key={index} className='emoji__container'>
              {emoji}
            </span>,
          );
        } else {
          nodes.push(emoji);
        }
      } else if (!systemEmojiFont && unqualified in unicodeMapping) {
        clearStack();

        const { unified, shortcode } = unicodeMapping[unqualified];

        const emoji = (
          <img
            key={index}
            draggable={false}
            className='emojione emoji'
            alt={unqualified}
            title={`:${shortcode}:`}
            src={joinPublicPath(`packs/emoji/${unified}.svg`)}
          />
        );

        if (truncated) {
          nodes.push(
            <span key={index} className='emoji__container'>
              {emoji}
            </span>,
          );
        } else {
          nodes.push(emoji);
        }
      } else if (!disableUserProvidedMedia && c === ':') {
        if (!open) {
          clearStack();
        }

        stack += ':';

        // we see another : we convert it and clear the stack buffer
        if (open) {
          nodes.push(
            <MaybeEmoji
              key={index}
              text={stack}
              emojis={emojis}
              nyaize={shouldNyaize}
              truncated={truncated}
            />,
          );
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

    if (stack.length) nodes.push(shouldNyaize ? nyaize(stack) : stack);

    return nodes;
  },
);

Emojify.displayName = 'Emojify';

export { Emojify as default };
