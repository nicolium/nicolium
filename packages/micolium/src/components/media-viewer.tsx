import { IconButton, Text } from '@mkljczk/react-native-paper';
import { Directory, File, Paths } from 'expo-file-system';
import { Image } from 'expo-image';
import { startActivityAsync } from 'expo-intent-launcher';
import { LinearGradient } from 'expo-linear-gradient';
import { shareAsync } from 'expo-sharing';
import { useVideoPlayer, VideoView } from 'expo-video';
import { DownloadIcon } from 'phosphor-react-native/src/icons/Download';
import { ExportIcon } from 'phosphor-react-native/src/icons/Export';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Modal, Platform, StatusBar, useWindowDimensions } from 'react-native';
import Gallery, { type RenderItemInfo } from 'react-native-awesome-gallery';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import { useMediaViewer, useUiStoreActions } from '@/stores/ui';

import { iconHelper } from './ui/icon';

import type { MediaAttachment } from 'pl-api';

const messages = defineMessages({
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
  download: { id: 'media_gallery.download', defaultMessage: 'Download' },
  share: { id: 'status.share', defaultMessage: 'Share' },
  shareFailed: { id: 'media_viewer.share.fail', defaultMessage: 'Failed to share file.' },
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

interface IMediaViewerVideo {
  media: MediaAttachment;
  loop: boolean;
}

const MediaViewerVideo: React.FC<IMediaViewerVideo> = ({ media, loop }) => {
  const player = useVideoPlayer(media.url, (player) => {
    player.loop = loop;
    player.muted = loop;
    player.play();
  });

  return (
    <VideoView
      player={player}
      style={{ flex: 1 }}
      contentFit='contain'
      nativeControls={!loop}
      surfaceType='textureView'
      accessibilityLabel={media.description}
    />
  );
};

interface IMediaViewerItem extends RenderItemInfo<MediaAttachment> {
  active: boolean;
}

const MediaViewerItem: React.FC<IMediaViewerItem> = ({
  item: media,
  active,
  setImageDimensions,
}) => {
  const { width, height } = useWindowDimensions();

  const original = 'meta' in media ? media.meta.original : undefined;

  React.useEffect(() => {
    if (media.type !== 'image') {
      setImageDimensions(original && 'width' in original ? original : { width, height });
    }
  }, [media.id, width, height]);

  if (media.type === 'image' || !active) {
    return (
      <Image
        style={{ flex: 1 }}
        source={{ uri: media.type === 'image' ? media.url : media.preview_url }}
        placeholder={{
          blurhash: (Platform.OS !== 'web' && media.blurhash) || undefined,
          uri: media.preview_url,
        }}
        accessibilityLabel={media.description}
        contentFit='contain'
        transition={300}
        recyclingKey={media.id}
        onLoad={({ source }) =>
          media.type === 'image' &&
          setImageDimensions({ width: source.width, height: source.height })
        }
      />
    );
  }

  return <MediaViewerVideo media={media} loop={media.type === 'gifv'} />;
};

const MediaViewer: React.FC = () => {
  const intl = useIntl();
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const mediaViewer = useMediaViewer();
  const { closeMediaViewer } = useUiStoreActions();

  const [index, setIndex] = React.useState(0);
  const [isSharing, setIsSharing] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [showDetails, setShowDetails] = React.useState(true);

  const media = mediaViewer?.media ?? [];
  const current = media[index];

  React.useEffect(() => {
    if (mediaViewer) {
      setIndex(mediaViewer.index);
    }
  }, [mediaViewer]);

  const handleShare = async () => {
    if (!current) return;

    setIsSharing(true);
    try {
      const destination = new Directory(Paths.document, 'micolium');
      if (!destination.exists) destination.create();

      const file = new File(destination, current.url.split('/').at(-1) || current.id);
      if (!file.exists) await File.downloadFileAsync(current.url, file);

      await shareAsync(file.uri, { mimeType: file.type });
    } catch {
      toast.error(intl.formatMessage(messages.shareFailed));
    }
    setIsSharing(false);
  };

  const handleDownload = async () => {
    if (!current) return;

    setIsDownloading(true);
    try {
      const destination = new Directory(Paths.cache, 'micolium');
      if (!destination.exists) destination.create();

      const file = new File(destination, current.url.split('/').at(-1) || current.id);
      if (!file.exists) {
        await File.downloadFileAsync(current.url, file);

        const openedToast = toast.success(
          intl.formatMessage(messages.downloaded, {
            name: file.name,
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
      } else {
        toast.error(intl.formatMessage(messages.fileAlreadyExists));
      }
    } catch {
      toast.error(intl.formatMessage(messages.downloadFailed));
    }
    setIsDownloading(false);
  };

  return (
    <Modal
      visible={!!mediaViewer}
      transparent
      animationType='fade'
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={closeMediaViewer}
      supportedOrientations={['portrait', 'landscape']}
    >
      <StatusBar barStyle='light-content' />
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000' }}>
        {mediaViewer && (
          <Gallery
            data={media}
            keyExtractor={(item) => item.id}
            initialIndex={mediaViewer.index}
            onIndexChange={setIndex}
            renderItem={(info) => <MediaViewerItem {...info} active={info.index === index} />}
            maxScale={5}
            doubleTapScale={2.5}
            onSwipeToClose={closeMediaViewer}
            onTap={() => setShowDetails((value) => !value)}
            style={{ backgroundColor: '#000' }}
          />
        )}
        {showDetails && (
          <>
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'transparent']}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                paddingTop: topInset,
                paddingHorizontal: 4,
                flexDirection: 'row',
                alignItems: 'center',
              }}
              pointerEvents='box-none'
            >
              <IconButton
                icon={iconHelper(XIcon)}
                iconColor='#fff'
                onPress={closeMediaViewer}
                accessibilityLabel={intl.formatMessage(messages.close)}
              />
              <Text variant='titleMedium' style={{ flex: 1, color: '#fff' }}>
                {media.length > 1 && (
                  <FormattedMessage
                    id='media_viewer.counter'
                    defaultMessage='{index} of {count}'
                    values={{ index: index + 1, count: media.length }}
                  />
                )}
              </Text>
              <IconButton
                icon={iconHelper(DownloadIcon)}
                iconColor='#fff'
                onPress={handleDownload}
                loading={isDownloading}
                disabled={isDownloading}
                accessibilityLabel={intl.formatMessage(messages.download)}
              />
              <IconButton
                icon={iconHelper(ExportIcon)}
                iconColor='#fff'
                onPress={handleShare}
                loading={isSharing}
                disabled={isSharing}
                accessibilityLabel={intl.formatMessage(messages.share)}
              />
            </LinearGradient>
            {current?.description ? (
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.6)']}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  paddingTop: 32,
                  paddingBottom: 16 + bottomInset,
                  paddingHorizontal: 16,
                }}
                pointerEvents='none'
              >
                <Text variant='bodyMedium' style={{ color: '#fff' }} numberOfLines={8}>
                  {current.description}
                </Text>
              </LinearGradient>
            ) : null}
          </>
        )}
      </GestureHandlerRootView>
    </Modal>
  );
};

export { MediaViewer };
