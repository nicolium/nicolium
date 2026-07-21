import React from 'react';

import { isCustomEmoji } from '@/emoji';
import unicodeMapping from '@/emoji/mapping';
import { useSettings } from '@/stores/settings';
import { joinPublicPath } from '@/utils/static';

import type { Emoji } from '@/emoji';

interface IAutosuggestEmoji {
  emoji: Emoji;
}

const AutosuggestEmoji: React.FC<IAutosuggestEmoji> = ({ emoji }) => {
  const { systemEmojiFont } = useSettings();

  let emojiElement;

  if (isCustomEmoji(emoji)) {
    emojiElement = <img className='emojione' src={emoji.imageUrl} alt={emoji.colons} />;
  } else {
    if (systemEmojiFont) emojiElement = emoji.native;

    const mapping =
      unicodeMapping[emoji.native] || unicodeMapping[emoji.native.replace(/\uFE0F$/, '')];

    if (!mapping) {
      return null;
    }

    emojiElement = (
      <img
        className='emojione'
        src={joinPublicPath(`packs/emoji/${mapping.unified}.svg`)}
        alt={emoji.native}
      />
    );
  }

  return (
    <div className='autosuggest-emoji' data-testid='emoji'>
      {emojiElement}

      {emoji.colons}
    </div>
  );
};

export { AutosuggestEmoji as default };
