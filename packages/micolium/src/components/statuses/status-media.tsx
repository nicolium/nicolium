import { Carousel, CarouselItem, Chip, Tooltip, useTheme } from '@mkljczk/react-native-paper';
import { Image } from 'expo-image';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Platform, View } from 'react-native';

import { useStatus } from '@/queries/statuses/use-status';

const messages = defineMessages({
  altIndicator: { id: 'upload_form.description_missing.indicator', defaultMessage: 'Alt' },
  altHeading: { id: 'media_gallery.description', defaultMessage: 'Image description' },
});

interface IStatusMedia {
  id: string;
  compact?: boolean;
}

const StatusMedia: React.FC<IStatusMedia> = ({ id, compact }) => {
  const intl = useIntl();
  const { colors, shapes } = useTheme();
  const { data: status } = useStatus(id);

  const filteredMedia = status?.media_attachments.filter((media) => media.type === 'image');

  if (!filteredMedia?.length) return null;

  return (
    <Carousel
      data={filteredMedia}
      height={compact ? 160 : 320}
      renderItem={({ item: media, index, mask }) => {
        const { width, height } = media.meta.original || {};
        return (
          <CarouselItem
            mask={mask}
            style={{ flexDirection: 'row', gap: 8, backgroundColor: colors.background }}
          >
            {index !== 0 && index === filteredMedia.length - 1 && <View aria-hidden />}
            <View style={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
              <Image
                key={media.id}
                style={{ flex: 1, borderRadius: shapes.corner.medium }}
                source={{ uri: media.url, width, height }}
                placeholder={{
                  blurhash: (Platform.OS !== 'web' && media.blurhash) || undefined,
                  width,
                  height,
                }}
                accessibilityLabel={media.description}
                contentFit='cover'
                transition={300}
                recyclingKey={media.id}
              />
              {media.description && (
                <View style={{ position: 'absolute', bottom: 16, right: 16 }}>
                  <Tooltip.Rich
                    title={intl.formatMessage(messages.altHeading)}
                    content={media.description}
                  >
                    {(props) => (
                      <Chip {...props} mode='outlined' compact>
                        {intl.formatMessage(messages.altIndicator).toUpperCase()}
                      </Chip>
                    )}
                  </Tooltip.Rich>
                </View>
              )}
            </View>
            {index !== filteredMedia.length - 1 && <View aria-hidden />}
          </CarouselItem>
        );
      }}
    />
  );
};

export { StatusMedia };
