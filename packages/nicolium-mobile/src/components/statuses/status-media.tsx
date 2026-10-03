import { Image } from 'expo-image';
import React from 'react';
import { View } from 'react-native';

import { useStatus } from '@/queries/statuses/use-status';

interface IStatusMedia {
  id: string;
}

const StatusMedia: React.FC<IStatusMedia> = ({ id }) => {
  const { data: status } = useStatus(id);

  if (!status?.media_attachments.length) return null;

  return (
    <View style={{ flex: 1, borderRadius: 8, overflow: 'hidden' }}>
      {status.media_attachments
        .filter((media) => media.type === 'image')
        .map((media) => {
          const { width, height } = media.meta.original || {};
          return (
            <Image
              key={media.id}
              style={{
                flex: 1,
                width: '100%',
                aspectRatio: width && height ? width / height : 1,
                maxHeight: 400,
                height: height || 'auto',
              }}
              source={{
                uri: media.url,
                width,
                height,
              }}
              placeholder={{
                // blurhash: media.blurhash || undefined,
                width,
                height,
              }}
              accessibilityLabel={media.description}
              contentFit='cover'
            />
          );
        })}
    </View>
  );
};

export { StatusMedia };
