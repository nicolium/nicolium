import { Carousel, CarouselItem, useTheme } from '@mkljczk/react-native-paper';
import { Image } from 'expo-image';
import React from 'react';
import { Platform, View } from 'react-native';

import { useStatus } from '@/queries/statuses/use-status';

interface IStatusMedia {
  id: string;
}

const StatusMedia: React.FC<IStatusMedia> = ({ id }) => {
  const { colors, shapes } = useTheme();
  const { data: status } = useStatus(id);

  const filteredMedia = status?.media_attachments.filter((media) => media.type === 'image');

  if (!filteredMedia?.length) return null;

  return (
    <Carousel
      data={filteredMedia}
      height={400}
      renderItem={({ item: media, index, mask }) => {
        const { width, height } = media.meta.original || {};
        return (
          <CarouselItem mask={mask} style={{ flexDirection: 'row', gap: 8, backgroundColor: colors.background }}>
            {index === filteredMedia.length - 1 && <View aria-hidden />}
            <Image
              key={media.id}
              style={{
                flex: 1,
                width: '100%',
                height: '100%',
                borderRadius: shapes.corner.medium
              }}
              source={{
                uri: media.url,
                width,
                height,
              }}
              placeholder={{
                blurhash: (Platform.OS !== 'web' && media.blurhash) || undefined,
                width,
                height,
              }}
              accessibilityLabel={media.description}
              contentFit='cover'
              transition={300}
            />
            {index !== filteredMedia.length - 1 && <View aria-hidden />}
          </CarouselItem>
        );
      }}
    />
  );
};

export { StatusMedia };
