import { Image } from 'expo-image';
import React from 'react';
import { Text } from 'react-native';

interface IEmoji {
  url?: string;
  shortcode?: string;
  emoji: string;
  size?: number;
}

const Emoji: React.FC<IEmoji> = ({ emoji, url, shortcode, size = 24 }) =>
  url ? (
    <Image
      source={{ uri: url }}
      accessibilityLabel={shortcode || emoji}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  ) : (
    <Text style={{ fontSize: size }}>{emoji}</Text>
  );

export { Emoji };
