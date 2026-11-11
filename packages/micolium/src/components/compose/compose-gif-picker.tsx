import { TrueSheet } from '@lodev09/react-native-true-sheet';
import {
  ActivityIndicator,
  IconButton,
  Searchbar,
  Text,
  useTheme,
} from '@mkljczk/react-native-paper';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { Directory, File, Paths } from 'expo-file-system';
import { useVideoPlayer, VideoView } from 'expo-video';
import { GifIcon } from 'phosphor-react-native/src/icons/Gif';
import { MagnifyingGlassIcon } from 'phosphor-react-native/src/icons/MagnifyingGlass';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Platform, Pressable } from 'react-native';

import { useInstance } from '@/contexts/current-account-context';
import { useDebounce } from '@/hooks/use-debounce';
import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';
import { useSearchGifs } from '@/queries/search/use-search-gifs';
import { useCompose, useUploadCompose } from '@/stores/compose';
import { toast } from '@/utils/toast';

import { EmptyMessage } from '../ui/empty-message';
import { iconHelper } from '../ui/icon';

import type { ICompose } from './compose';
import type { GifResult, GifResults } from 'pl-api';

const messages = defineMessages({
  button: { id: 'compose_form.gif_button', defaultMessage: 'Search GIFs' },
  placeholder: { id: 'gif_picker_modal.search.placeholder', defaultMessage: 'Search GIFs' },
  error: { id: 'gif_picker_modal.error', defaultMessage: 'Failed to upload GIF' },
});

interface IGifItem {
  gif: GifResult;
  onSelect: (value: GifResult) => void;
  disabled: boolean;
}

const GifItem: React.FC<IGifItem> = ({ gif, onSelect, disabled }) => {
  const { colors, shapes } = useTheme();
  const player = useVideoPlayer(gif.url, (player) => {
    player.loop = true;
    player.muted = true;
    player.audioMixingMode = 'mixWithOthers';
    player.play();
  });

  return (
    <Pressable
      onPress={() => onSelect(gif)}
      disabled={disabled}
      style={{
        flex: 1,
        aspectRatio: 1,
        margin: 2,
        borderRadius: shapes.corner.medium,
        overflow: 'hidden',
        backgroundColor: colors.surfaceContainerHighest,
        opacity: disabled ? 0.5 : 1,
      }}
      accessibilityRole='button'
      accessibilityLabel={gif.description || undefined}
    >
      <VideoView
        player={player}
        style={{ flex: 1 }}
        contentFit='cover'
        nativeControls={false}
        surfaceType='textureView'
        pointerEvents='none'
      />
    </Pressable>
  );
};

interface IGifPicker {
  composeId: string;
  onClose: () => void;
  ref?: React.Ref<FlashListRef<GifResult>>;
}

const GifPicker: React.FC<IGifPicker> = ({ composeId, onClose, ref }) => {
  const { colors } = useTheme();
  const intl = useIntl();

  const uploadCompose = useUploadCompose(composeId);

  const [value, setValue] = React.useState('');
  const debouncedValue = useDebounce(value, 400);
  const { data: gifsResult, isFetching, isError } = useSearchGifs(debouncedValue);
  const [isUploading, setIsUploading] = React.useState(false);
  const [previousResult, setPreviousResult] = React.useState<GifResults | undefined>(undefined);

  const isEmpty = value.trim().length === 0;

  const handleSelect = async (gif: GifResult) => {
    setIsUploading(true);

    try {
      const destination = new Directory(Paths.cache, 'micolium');
      if (!destination.exists) destination.create();

      const file = await File.downloadFileAsync(gif.url, destination, { idempotent: true });

      uploadCompose(
        [{ uri: file.uri, name: file.name, type: file.type || 'video/mp4', size: file.size }],
        [gif.description || ''],
      );
      onClose();
    } catch {
      setIsUploading(false);
      toast.error(intl.formatMessage(messages.error));
    }
  };

  React.useEffect(() => {
    if (gifsResult) {
      setPreviousResult(gifsResult);
    }
  }, [gifsResult]);

  const gifsToDisplay = isEmpty ? undefined : gifsResult || previousResult;

  let emptyComponent;
  if (isEmpty) {
    emptyComponent = (
      <EmptyMessage
        emptyMessageIcon={iconHelper(MagnifyingGlassIcon)}
        emptyMessageText={
          <FormattedMessage
            id='gif_picker_modal.prompt_message'
            defaultMessage='Search for GIFs to attach to your post.'
          />
        }
      />
    );
  } else if (!gifsToDisplay && !isError) {
    emptyComponent = <ActivityIndicator style={{ margin: 16 }} />;
  } else if (isError) {
    emptyComponent = (
      <EmptyMessage
        emptyMessageText={
          <FormattedMessage
            id='gif_picker_modal.error_message'
            defaultMessage='An error occurred while searching for GIFs.'
          />
        }
      />
    );
  } else {
    emptyComponent = (
      <EmptyMessage
        emptyMessageText={
          <FormattedMessage
            id='gif_picker_modal.empty_message'
            defaultMessage='There are no GIFs matching your search.'
          />
        }
      />
    );
  }

  return (
    <FlashList
      ref={ref}
      data={gifsToDisplay?.results}
      numColumns={3}
      extraData={isFetching || isUploading}
      keyExtractor={(gif) => gif.id}
      ListHeaderComponent={
        <Searchbar
          placeholder={intl.formatMessage(messages.placeholder)}
          value={value}
          onChangeText={setValue}
          loading={isUploading}
          style={{
            marginHorizontal: 0,
            marginBottom: 16,
            borderColor: colors.outlineVariant,
            borderWidth: 1,
          }}
        />
      }
      ListEmptyComponent={emptyComponent}
      ListFooterComponent={
        gifsToDisplay?.provider ? (
          <Text
            variant='bodySmall'
            style={{ textAlign: 'center', marginVertical: 16, color: colors.onSurfaceVariant }}
          >
            <FormattedMessage
              id='gif_picker_modal.provider'
              defaultMessage='Powered by {provider}'
              values={{ provider: gifsToDisplay.provider }}
            />
          </Text>
        ) : null
      }
      renderItem={({ item }) => (
        <GifItem gif={item} onSelect={handleSelect} disabled={isFetching || isUploading} />
      )}
    />
  );
};

interface IComposeGifPicker {
  composeId: string;
  visible: boolean;
  onDismiss: () => void;
}

const ComposeGifPicker: React.FC<IComposeGifPicker> = ({ composeId, visible, onDismiss }) => {
  const glassEffect = useEnableLiquidGlass();
  const { colors } = useTheme();

  const [closing, setClosing] = React.useState(false);

  const bottomSheetRef = React.useRef<TrueSheet>(null);
  const scrollableRef = React.useRef<FlashListRef<GifResult>>(null);

  React.useEffect(() => {
    if (visible) setClosing(false);
  }, [visible]);

  React.useEffect(() => {
    if (visible && !closing) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible, closing]);

  return (
    <TrueSheet
      ref={bottomSheetRef}
      detents={[0.5, 'auto']}
      onDidDismiss={onDismiss}
      scrollableRef={scrollableRef}
      style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 16 : 32, paddingHorizontal: 16 }}
      backgroundColor={glassEffect ? undefined : colors.surfaceContainer}
    >
      <GifPicker ref={scrollableRef} composeId={composeId} onClose={() => setClosing(true)} />
    </TrueSheet>
  );
};

const ComposeGifPickerButton: React.FC<ICompose> = ({ composeId }) => {
  const intl = useIntl();
  const { configuration } = useInstance();
  const { isUploading, mediaAttachments, poll } = useCompose(composeId);

  const [showPicker, setShowPicker] = React.useState(false);

  return (
    <>
      <IconButton
        icon={iconHelper(GifIcon)}
        style={{ marginHorizontal: 0 }}
        onPress={() => setShowPicker(true)}
        disabled={
          !!poll ||
          isUploading ||
          mediaAttachments.length >= configuration.statuses.max_media_attachments
        }
        accessibilityLabel={intl.formatMessage(messages.button)}
      />
      {showPicker && (
        <ComposeGifPicker
          composeId={composeId}
          visible={showPicker}
          onDismiss={() => setShowPicker(false)}
        />
      )}
    </>
  );
};

export { ComposeGifPickerButton };
