import React from 'react';

import StillImage from 'pl-fe/components/still-image';
import { useSettings } from 'pl-fe/stores/settings';
import { removeVS16s, toCodePoints } from 'pl-fe/utils/emoji';
import { joinPublicPath } from 'pl-fe/utils/static';

interface IEmoji extends Pick<React.ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'className' | 'src' | 'title'> {
  /** Unicode emoji character. */
  emoji?: string;
  noGroup?: boolean;
}

/** A single emoji image. */
const Emoji: React.FC<IEmoji> = (props): JSX.Element | null => {
  const { disableUserProvidedMedia, systemEmojiFont } = useSettings();
  const { emoji, alt, src, noGroup, ...rest } = props;

  let filename;

  if (emoji) {
    const codepoints = toCodePoints(removeVS16s(emoji));
    filename = codepoints.join('-');
  }

  if (!filename && !src) return null;

  if (src) {
    if (disableUserProvidedMedia) return (
      <>
        {alt || <span className={rest.className}>{emoji}</span>}
      </>
    );
    return (
      <StillImage
        alt={alt || emoji}
        src={src}
        isGif
        noGroup={noGroup}
        letterboxed
        {...rest}
      />
    );
  }

  if (systemEmojiFont) return <span className={rest.className}>{emoji}</span>;

  return (
    <img
      draggable='false'
      alt={alt || emoji}
      src={joinPublicPath(`packs/emoji/${filename}.svg`)}
      {...rest}
    />
  );
};

export { Emoji as default };
