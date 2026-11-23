import { Image, type ImageProps } from 'expo-image';
import React from 'react';

import { useAutoPlayGif } from '@/hooks/use-auto-play-gif';

interface IStillImage extends Omit<ImageProps, 'source' | 'autoplay'> {
  src: string;
  staticSrc?: string;
}

const StillImage: React.FC<IStillImage> = ({ src, staticSrc, ...props }) => {
  const autoPlayGif = useAutoPlayGif();

  return (
    <Image
      source={{ uri: autoPlayGif ? src : staticSrc || src }}
      autoplay={autoPlayGif}
      {...props}
    />
  );
};

export { StillImage };
