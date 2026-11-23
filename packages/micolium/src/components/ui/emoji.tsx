import React from 'react';
import { Text } from 'react-native';

import { StillImage } from '@/components/still-image';

interface IEmoji {
  url?: string;
  staticUrl?: string;
  shortcode?: string;
  emoji: string;
  size?: number;
}

const Emoji: React.FC<IEmoji> = ({ emoji, url, staticUrl, shortcode, size = 24 }) =>
  url ? (
    <StillImage
      src={url}
      staticSrc={staticUrl}
      accessibilityLabel={shortcode || emoji}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  ) : (
    <Text
      style={{
        fontSize: size * 0.9,
        lineHeight: size,
        height: size,
      }}
    >
      {emoji}
    </Text>
  );

export { Emoji };
