import { VisibilitySensor } from '@futurejj/react-native-visibility-sensor';
import {
  Button,
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
import { startActivityAsync } from 'expo-intent-launcher';
import { shareAsync } from 'expo-sharing';
import { useVideoPlayer, VideoView } from 'expo-video';
import { EyeIcon } from 'phosphor-react-native/src/icons/Eye';
import { EyeSlashIcon } from 'phosphor-react-native/src/icons/EyeSlash';
import { PaperclipIcon } from 'phosphor-react-native/src/icons/Paperclip';
import { PlayIcon } from 'phosphor-react-native/src/icons/Play';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { toast } from 'sonner-native';

import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';
import { useUiStoreActions } from '@/stores/ui';

import { MIMETYPE_ICONS } from '../compose/compose-attachment-thumbs';
import { iconHelper } from '../ui/icon';

import type { SelectedStatus } from '@/queries/statuses/use-status';
import type { FilterResult } from 'pl-api';

const messages = defineMessages({
  altIndicator: { id: 'upload_form.description_missing.indicator', defaultMessage: 'Alt' },
  altHeading: { id: 'media_gallery.description', defaultMessage: 'Image description' },
  altHeadingVideo: { id: 'media_gallery.description.video', defaultMessage: 'Video description' },
  play: { id: 'video.play', defaultMessage: 'Play' },
  downloaded: {
    id: 'media_gallery.download.success',
    defaultMessage: 'File {name} downloaded successfully',
  },
  downloadOpen: {
    id: 'media_gallery.download.open',
    defaultMessage: 'Open',
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
  sensitive?: boolean;
  mediaVisible?: boolean;
  setImageDimensions?: (_: { height: number; width: number }) => void;
}

const StatusImage: React.FC<IStatusImage> = ({
  media,
  uri,
  sensitive,
  mediaVisible,
  setImageDimensions,
}) => {
  const { colors } = useTheme();

  const { width, height } = media.meta.original || {};
  const hidden = sensitive && !mediaVisible;

  return (
    <Image
      style={{ flex: 1, backgroundColor: hidden ? colors.surfaceContainer : undefined }}
      source={{ uri: hidden ? undefined : uri, width, height }}
      placeholder={{
        blurhash: (Platform.OS !== 'web' && media.blurhash) || undefined,
        width,
        height,
      }}
      accessibilityLabel={media.description}
      contentFit='cover'
      transition={300}
      recyclingKey={`${hidden ? 'hidden-' : ''}${media.id}`}
      onLoad={
        setImageDimensions
          ? ({ source }) =>
              media.type === 'image' &&
              setImageDimensions({ width: source.width, height: source.height })
          : undefined
      }
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

const renderMedia = (
  media: SupportedMediaAttachment,
  sensitive?: boolean,
  mediaVisible?: boolean,
  setImageDimensions?: (_: { height: number; width: number }) => void,
) => {
  if (sensitive && mediaVisible !== true) {
    return (
      <StatusImage
        media={media}
        uri={media.preview_url}
        sensitive={sensitive}
        mediaVisible={mediaVisible}
        setImageDimensions={setImageDimensions}
      />
    );
  }

  switch (media.type) {
    case 'image':
      return (
        <StatusImage
          media={media}
          uri={media.preview_url}
          sensitive={sensitive}
          mediaVisible={mediaVisible}
          setImageDimensions={setImageDimensions}
        />
      );
    case 'gifv':
      return <StatusGifv media={media} />;
    case 'video':
      return <StatusVideo media={media} />;
  }
};

interface IStatusMedia {
  status: Pick<SelectedStatus, 'media_attachments' | 'sensitive'>;
  compact?: boolean;
  filters?: Array<FilterResult>;
  mediaVisible?: boolean;
  revealStatusMedia?: () => void;
  hideStatusMedia?: () => void;
}

const StatusMedia: React.FC<IStatusMedia> = ({
  status,
  compact,
  filters,
  mediaVisible,
  revealStatusMedia,
  hideStatusMedia,
}) => {
  const intl = useIntl();
  const { colors, shapes } = useTheme();
  const { openMediaViewer } = useUiStoreActions();

  const matchedFilters = React.useMemo(() => filters?.map(({ filter }) => filter.title), [filters]);

  const [imageDimensions, setImageDimensions] = React.useState<{ width: number; height: number }>();

  if (!status.media_attachments.length) return null;

  const filteredMedia = status.media_attachments.filter(isSupportedMedia);
  const unsupportedMedia = status.media_attachments.filter(isUnsupportedMedia);

  const sensitive = status.sensitive || !!filters?.length;

  const renderSensitiveOverlay = () =>
    sensitive && (
      <>
        <IconButton
          icon={iconHelper(mediaVisible ? EyeSlashIcon : EyeIcon)}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            borderRadius: shapes.corner.medium,
          }}
          mode='contained'
          onPress={mediaVisible ? hideStatusMedia : revealStatusMedia}
        />
        {!mediaVisible && (
          <TouchableRipple
            onPress={revealStatusMedia}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1,
              minWidth: '60%',
              maxWidth: '90%',
              backgroundColor: colors.surfaceVariant,
              borderRadius: shapes.corner.medium,
              padding: 8,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <>
              <Text variant='titleSmallEmphasized' style={{ textAlign: 'center', marginBottom: 4 }}>
                <FormattedMessage
                  id='status.sensitive_warning'
                  defaultMessage='Sensitive content'
                />
              </Text>
              <Text variant='bodyMedium' style={{ textAlign: 'center' }} numberOfLines={2}>
                {matchedFilters?.length ? (
                  <FormattedMessage
                    id='status.sensitive_warning.matches_filters'
                    defaultMessage='Matches filters: {filters}'
                    values={{
                      filters: intl.formatList(matchedFilters, { type: 'conjunction' }),
                    }}
                  />
                ) : (
                  <FormattedMessage
                    id='status.sensitive_warning.subtitle'
                    defaultMessage='This content may not be suitable for all audiences.'
                  />
                )}
              </Text>
              <Button compact onPress={revealStatusMedia}>
                <FormattedMessage id='moderation_overlay.show' defaultMessage='Show content' />
              </Button>
            </>
          </TouchableRipple>
        )}
      </>
    );

  const renderItem = (media: SupportedMediaAttachment, multiple = filteredMedia.length > 1) => {
    const { width, height } = media.meta.original || imageDimensions || {};
    const aspectRatio = !multiple && width && height ? width / height : undefined;

    return (
      <View
        key={media.id}
        style={{
          flex: multiple ? 1 : undefined,
          width: '100%',
          height: multiple ? '100%' : aspectRatio ? undefined : compact ? 160 : 320,
          aspectRatio,
          maxHeight: multiple ? undefined : compact ? 240 : 480,
          position: 'relative',
          borderRadius: shapes.corner.medium,
          overflow: 'hidden',
        }}
      >
        {!multiple && renderSensitiveOverlay()}
        {media.type === 'video' ? (
          renderMedia(media, sensitive, mediaVisible)
        ) : (
          <Pressable
            style={{ flex: 1 }}
            onPress={() => openMediaViewer(filteredMedia, filteredMedia.indexOf(media))}
            accessibilityRole='imagebutton'
            accessibilityLabel={media.description || undefined}
          >
            {renderMedia(
              media,
              sensitive,
              mediaVisible,
              media.meta.original || multiple ? undefined : setImageDimensions,
            )}
          </Pressable>
        )}
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
  };

  const renderSupportedMedia = () => {
    if (!filteredMedia.length) return null;
    if (filteredMedia.length === 1) return renderItem(filteredMedia[0]);

    return (
      <View style={{ position: 'relative' }}>
        {renderSensitiveOverlay()}
        <Carousel
          data={filteredMedia}
          height={compact ? 160 : 320}
          disabled={sensitive && !mediaVisible}
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
          style={{ pointerEvents: sensitive && !mediaVisible ? 'none' : 'auto' }}
        />
      </View>
    );
  };

  const handleDownload = async (media: UnsupportedMediaAttachment) => {
    try {
      const destination = new Directory(Paths.document, 'micolium');
      if (!destination.exists) destination.create();

      const file = await File.downloadFileAsync(media.url, destination);

      const openedToast = toast.success(
        intl.formatMessage(messages.downloaded, {
          name: media.url.split('/').at(-1),
        }),
        {
          action: {
            label: intl.formatMessage(messages.downloadOpen),
            onClick: async () => {
              toast.dismiss(openedToast);

              if (Platform.OS === 'android') {
                await startActivityAsync('android.intent.action.VIEW', {
                  data: file.contentUri,
                  flags: 1,
                  type: file.type,
                });
              } else {
                await shareAsync(file.uri, { mimeType: file.type });
              }
            },
          },
        },
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
              <Icon
                source={iconHelper(
                  MIMETYPE_ICONS[(media.type === 'unknown' && media.mime_type) || media.type] ??
                    PaperclipIcon,
                )}
                size={20}
              />
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

export { StatusMedia, renderMedia };
