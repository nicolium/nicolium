import React from 'react';

import unicodeMapping from '@/features/emoji/mapping';
import { useSettings } from '@/stores/settings';
import { joinPublicPath } from '@/utils/static';

import type { CustomEmoji } from 'pl-api';

interface IEmoji {
  emoji: string;
  emojiMap: Record<string, CustomEmoji>;
  hovered: boolean;
}

const Emoji: React.FC<IEmoji> = ({ emoji, emojiMap, hovered }) => {
  const { autoPlayGif, reduceMotion, systemEmojiFont } = useSettings();

  if (unicodeMapping[emoji]) {
    if (systemEmojiFont) return emoji;

    const { unified, shortcode } = unicodeMapping[emoji];
    const title = shortcode ? `:${shortcode}:` : '';

    return (
      <img
        draggable='false'
        className='emojione m-0 block'
        alt={emoji}
        title={title}
        src={joinPublicPath(`packs/emoji/${unified}.svg`)}
      />
    );
  } else if (emojiMap[emoji]) {
    const filename =
      (autoPlayGif && !reduceMotion) || hovered ? emojiMap[emoji].url : emojiMap[emoji].static_url;
    const shortCode = `:${emoji}:`;

    return (
      <img
        draggable='false'
        className='emojione m-0 block'
        alt={shortCode}
        title={shortCode}
        src={filename}
      />
    );
  } else {
    return null;
  }
};

export { Emoji as default };
