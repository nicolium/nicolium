import { VisibilitySensor } from '@futurejj/react-native-visibility-sensor';
import {
  Carousel,
  CarouselItem,
  Chip,
  Icon,
  IconButton,
  Text,
  Tooltip,
  TouchableRipple,
  useTheme,
} from '@mkljczk/react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import { Directory, File, Paths } from 'expo-file-system';
import { GlassView } from 'expo-glass-effect';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { PaperclipIcon, PlayIcon } from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { toast } from 'sonner-native';

import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';

import { iconHelper } from '../ui/icon';

import type { SelectedStatus } from '@/queries/statuses/use-status';

const messages = defineMessages({
  altIndicator: { id: 'upload_form.description_missing.indicator', defaultMessage: 'Alt' },
  altHeading: { id: 'media_gallery.description', defaultMessage: 'Image description' },
  altHeadingVideo: { id: 'media_gallery.description.video', defaultMessage: 'Video description' },
  play: { id: 'video.play', defaultMessage: 'Play' },
  downloaded: {
    id: 'media_gallery.download.success',
    defaultMessage: 'File {name} downloaded successfully',
  },
  fileAlreadyExists: {
    id: 'media_gallery.download.fail.already_exists',
    defaultMessage: 'Failed to download file. File already exists.',
  },
  downloadFailed: {
    id: 'media_gallery.download.success',
    defaultMessage: 'Failed to download file.',
  },
});

type MediaAttachment = SelectedStatus['media_attachments'][number];
type SupportedMediaAttachment = Extract<MediaAttachment, { type: 'image' | 'video' | 'gifv' }>;
type UnsupportedMediaAttachment = Extract<MediaAttachment, { type: 'audio' | 'unknown' }>;

const isSupportedMedia = (media: MediaAttachment): media is SupportedMediaAttachment =>
  media.type === 'image' || media.type === 'video' || media.type === 'gifv';

const isUnsupportedMedia = (media: MediaAttachment): media is UnsupportedMediaAttachment =>
  media.type === 'audio' || media.type === 'unknown';

interface IStatusImage {
  media: SupportedMediaAttachment;
  uri: string;
}

const StatusImage: React.FC<IStatusImage> = ({ media, uri }) => {
  const { width, height } = media.meta.original || {};

  return (
    <Image
      style={{ flex: 1 }}
      source={{ uri, width, height }}
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
  );
};

interface IMediaVideo {
  media: Extract<MediaAttachment, { type: 'video' | 'gifv' }>;
}

const StatusGifv: React.FC<IMediaVideo> = ({ media }) => {
  const isFocused = useIsFocused();
  const player = useVideoPlayer(media.url, (player) => {
    player.loop = true;
    player.muted = true;
    player.audioMixingMode = 'mixWithOthers';
  });

  useEffect(() => {
    if (isFocused) player.play();
    else player.pause();
  }, [isFocused, player]);

  return (
    <VisibilitySensor
      onChange={(visible) => !visible && player.pause()}
      threshold={{ top: 60, bottom: 60 }}
      style={{ flex: 1 }}
    >
      <VideoView
        player={player}
        style={{ flex: 1 }}
        contentFit='cover'
        nativeControls={false}
        surfaceType='textureView'
        accessibilityLabel={media.description}
      />
    </VisibilitySensor>
  );
};

const StatusVideoPlayer: React.FC<IMediaVideo> = ({ media }) => {
  const { colors } = useTheme();
  const isFocused = useIsFocused();
  const player = useVideoPlayer(media.url, (player) => {
    player.play();
  });

  useEffect(() => {
    if (!isFocused) player.pause();
  }, [isFocused, player]);

  return (
    <VisibilitySensor
      onChange={(visible) => !visible && player.pause()}
      threshold={{ top: 60, bottom: 60 }}
      style={{ flex: 1 }}
    >
      <VideoView
        player={player}
        style={{ flex: 1, backgroundColor: colors.scrim }}
        contentFit='contain'
        fullscreenOptions={{ enable: true }}
        surfaceType='textureView'
        accessibilityLabel={media.description}
      />
    </VisibilitySensor>
  );
};

const StatusVideo: React.FC<IMediaVideo> = ({ media }) => {
  const intl = useIntl();
  const [active, setActive] = useState(false);

  const glassEffect = useEnableLiquidGlass();

  return (
    <View style={{ flex: 1 }} onStartShouldSetResponder={() => true}>
      {active ? (
        <StatusVideoPlayer media={media} />
      ) : (
        <>
          <StatusImage media={media} uri={media.preview_url} />
          <View
            style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}
          >
            {glassEffect ? (
              <Pressable
                onPress={() => setActive(true)}
                accessibilityLabel={intl.formatMessage(messages.play)}
              >
                <GlassView
                  style={{ borderRadius: 36, padding: 16 }}
                  glassEffectStyle='clear'
                  isInteractive
                >
                  <PlayIcon weight='fill' size={40} color='#fff' />
                </GlassView>
              </Pressable>
            ) : (
              <IconButton
                mode='contained'
                icon={(props) => <PlayIcon {...props} weight='fill' />}
                onPress={() => setActive(true)}
                accessibilityLabel={intl.formatMessage(messages.play)}
              />
            )}
          </View>
        </>
      )}
    </View>
  );
};

const renderMedia = (media: SupportedMediaAttachment) => {
  switch (media.type) {
    case 'image':
      return <StatusImage media={media} uri={media.url} />;
    case 'gifv':
      return <StatusGifv media={media} />;
    case 'video':
      return <StatusVideo media={media} />;
  }
};

interface IStatusMedia {
  status: Pick<SelectedStatus, 'media_attachments'>;
  compact?: boolean;
}

const StatusMedia: React.FC<IStatusMedia> = ({ status, compact }) => {
  const intl = useIntl();
  const { colors, shapes } = useTheme();

  if (!status.media_attachments.length) return null;

  const filteredMedia = status.media_attachments.filter(isSupportedMedia);
  const unsupportedMedia = status.media_attachments.filter(isUnsupportedMedia);

  const renderItem = (media: SupportedMediaAttachment, multiple = filteredMedia.length > 1) => (
    <View
      key={media.id}
      style={{
        flex: 1,
        width: '100%',
        height: multiple ? '100%' : compact ? 160 : 320,
        position: 'relative',
        borderRadius: shapes.corner.medium,
        overflow: 'hidden',
      }}
    >
      {renderMedia(media)}
      {media.description && (
        <View style={{ position: 'absolute', bottom: 16, right: 16 }}>
          <Tooltip.Rich
            title={intl.formatMessage(
              media.type === 'image' ? messages.altHeading : messages.altHeadingVideo,
            )}
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
  );

  const renderSupportedMedia = () => {
    if (!filteredMedia.length) return null;
    if (filteredMedia.length === 1) return renderItem(filteredMedia[0]);

    return (
      <Carousel
        data={filteredMedia}
        height={compact ? 160 : 320}
        renderItem={({ item: media, index, mask }) => (
          <CarouselItem
            mask={mask}
            style={{ flexDirection: 'row', gap: 8, backgroundColor: colors.background }}
          >
            {index !== 0 && index === filteredMedia.length - 1 && <View aria-hidden />}
            {renderItem(media)}
            {index !== filteredMedia.length - 1 && <View aria-hidden />}
          </CarouselItem>
        )}
      />
    );
  };

  const handleDownload = async (media: UnsupportedMediaAttachment) => {
    const destination = new Directory(Paths.document, 'micolium');
    try {
      destination.create();
      await File.downloadFileAsync(media.url, destination);

      toast.success(
        intl.formatMessage(messages.downloaded, {
          name: media.url.split('/').at(-1),
        }),
      );
    } catch (error: any) {
      if (error?.code === 'ERR_FILE_ALREADY_EXISTS') {
        toast.error(intl.formatMessage(messages.fileAlreadyExists));
      } else {
        toast.error(intl.formatMessage(messages.downloadFailed));
      }
    }
  };

  const renderUnsupportedMedia = () => {
    if (!unsupportedMedia) return null;

    return (
      <View style={{ gap: 4 }}>
        {unsupportedMedia.map((media) => (
          <TouchableRipple
            key={media.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
            onPress={() => handleDownload(media)}
          >
            <>
              <Icon source={iconHelper(PaperclipIcon)} size={20} />
              <Text>{media.url.split('/').at(-1)}</Text>
            </>
          </TouchableRipple>
        ))}
      </View>
    );
  };

  return (
    <>
      {renderSupportedMedia()}
      {renderUnsupportedMedia()}
    </>
  );
};

export { StatusMedia };
