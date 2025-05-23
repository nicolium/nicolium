import React from 'react';

import { isCustomEmoji } from 'pl-fe/features/emoji';
import unicodeMapping from 'pl-fe/features/emoji/mapping';
import { useSettings } from 'pl-fe/hooks/use-settings';
import { joinPublicPath } from 'pl-fe/utils/static';

import type { Emoji } from 'pl-fe/features/emoji';

interface IAutosuggestEmoji {
  emoji: Emoji;
}

const AutosuggestEmoji: React.FC<IAutosuggestEmoji> = ({ emoji }) => {
  const { systemEmojiFont } = useSettings();

  let emojiElement;

  if (isCustomEmoji(emoji)) {
    emojiElement = (
      <img
        className='emojione mr-2 block size-4'
        src={emoji.imageUrl}
        alt={emoji.colons}
      />
    );
  } else {
    if (systemEmojiFont) emojiElement = <>{emoji.native}</>;

    const mapping = unicodeMapping[emoji.native] || unicodeMapping[emoji.native.replace(/\uFE0F$/, '')];

    if (!mapping) {
      return null;
    }

    emojiElement = (
      <img
        className='emojione mr-2 block size-4'
        src={joinPublicPath(`packs/emoji/${mapping.unified}.svg`)}
        alt={emoji.native}
      />
    );
  }

  return (
    <div className='flex flex-row items-center justify-start text-sm leading-[18px]' data-testid='emoji'>
      {emojiElement}

      {emoji.colons}
    </div>
  );
};

export { AutosuggestEmoji as default };
