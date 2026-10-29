import { ActivityIndicator, Icon, Text, TextInput, useTheme } from '@mkljczk/react-native-paper';
import { GlassView } from 'expo-glass-effect';
import { Image } from 'expo-image';
import { BookIcon } from 'phosphor-react-native/src/icons/Book';
import { FileArchiveIcon } from 'phosphor-react-native/src/icons/FileArchive';
import { FileCodeIcon } from 'phosphor-react-native/src/icons/FileCode';
import { FileCssIcon } from 'phosphor-react-native/src/icons/FileCss';
import { FileDocIcon } from 'phosphor-react-native/src/icons/FileDoc';
import { FileHtmlIcon } from 'phosphor-react-native/src/icons/FileHtml';
import { FileJsIcon } from 'phosphor-react-native/src/icons/FileJs';
import { FilePdfIcon } from 'phosphor-react-native/src/icons/FilePdf';
import { FilePptIcon } from 'phosphor-react-native/src/icons/FilePpt';
import { FilePyIcon } from 'phosphor-react-native/src/icons/FilePy';
import { FileTextIcon } from 'phosphor-react-native/src/icons/FileText';
import { FileXlsIcon } from 'phosphor-react-native/src/icons/FileXls';
import { FileZipIcon } from 'phosphor-react-native/src/icons/FileZip';
import { ImageIcon } from 'phosphor-react-native/src/icons/Image';
import { MusicNotesSimpleIcon } from 'phosphor-react-native/src/icons/MusicNotesSimple';
import { PaperclipIcon } from 'phosphor-react-native/src/icons/Paperclip';
import { PresentationIcon } from 'phosphor-react-native/src/icons/Presentation';
import { TableIcon } from 'phosphor-react-native/src/icons/Table';
import { VideoIcon } from 'phosphor-react-native/src/icons/Video';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import {
  type NativeSyntheticEvent,
  type NativeTouchEvent,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { toast } from 'sonner-native';

import DropdownMenu from '@/components/ui/dropdown-menu';
import { useFeatures } from '@/contexts/current-account-context';
import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';
import { useChangeUploadCompose, useCompose, useComposeActions } from '@/stores/compose';
import { getPointerPosition } from '@/utils/media';

import { renderMedia } from '../statuses/status-media';
import { DialogOrSheet } from '../ui/dialog-or-sheet';
import { iconHelper } from '../ui/icon';

import type { ICompose } from './compose';
import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import type { MediaAttachment } from 'pl-api';

const MIMETYPE_ICONS: Record<string, PhosphorIcon> = {
  'application/x-freearc': FileArchiveIcon,
  'application/x-bzip': FileArchiveIcon,
  'application/x-bzip2': FileArchiveIcon,
  'application/gzip': FileArchiveIcon,
  'application/vnd.rar': FileArchiveIcon,
  'application/x-tar': FileArchiveIcon,
  'application/zip': FileZipIcon,
  'application/x-7z-compressed': FileArchiveIcon,
  'application/x-csh': FileCssIcon,
  'application/html': FileHtmlIcon,
  'text/javascript': FileJsIcon,
  'application/javascript': FileJsIcon,
  'application/json': FileCodeIcon,
  'application/ld+json': FileCodeIcon,
  'application/x-httpd-php': FileCodeIcon,
  'application/x-sh': FileCodeIcon,
  'application/xhtml+xml': FileCodeIcon,
  'application/xml': FileCodeIcon,
  'text/x-script.python': FilePyIcon,
  'application/epub+zip': BookIcon,
  'application/vnd.oasis.opendocument.spreadsheet': TableIcon,
  'application/vnd.ms-excel': FileXlsIcon,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileXlsIcon,
  'application/pdf': FilePdfIcon,
  'application/vnd.oasis.opendocument.presentation': PresentationIcon,
  'application/vnd.ms-powerpoint': FilePptIcon,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': PresentationIcon,
  'text/plain': FileTextIcon,
  'application/rtf': FileTextIcon,
  'application/msword': FileDocIcon,
  'application/x-abiword': FileTextIcon,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileDocIcon,
  'application/vnd.oasis.opendocument.text': FileTextIcon,
  image: ImageIcon,
  video: VideoIcon,
  gifv: VideoIcon,
  audio: MusicNotesSimpleIcon,
};

const messages = defineMessages({
  edit: {
    id: 'upload_form.edit',
    defaultMessage: 'Edit attachment',
  },
  delete: { id: 'upload_form.undo', defaultMessage: 'Delete' },
  moveToLeft: { id: 'upload_form.move_to_left', defaultMessage: 'Move to left' },
  moveToRight: { id: 'upload_form.move_to_right', defaultMessage: 'Move to right' },
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
  save: { id: 'common.save', defaultMessage: 'Save' },
  titleVisual: {
    id: 'alt_text_modal.describe_for_people_with_visual_impairments',
    defaultMessage: 'Describe this for people with visual impairments…',
  },
  titleHearing: {
    id: 'alt_text_modal.describe_for_people_with_hearing_impairments',
    defaultMessage: 'Describe this for people with hearing impairments…',
  },
  placeholder: {
    id: 'placeholder',
    defaultMessage: 'Media description',
  },
  savingFailed: {
    id: 'alt_text_modal.save.fail',
    defaultMessage: 'Failed to save alt text',
  },
});

interface IComposeAttachmentEditor {
  composeId: string;
  media: MediaAttachment;
  visible: boolean;
  onDismiss: () => void;
}

const ComposeAttachmentEditor: React.FC<IComposeAttachmentEditor> = ({
  composeId,
  media,
  visible,
  onDismiss,
}) => {
  const intl = useIntl();
  const { colors, shapes } = useTheme();
  const changeUploadCompose = useChangeUploadCompose(composeId);
  const features = useFeatures();
  const glassEffect = useEnableLiquidGlass();

  const withFocalPoint = features.focalPoint && (media.type === 'image' || media.type === 'gifv');

  const [closing, setClosing] = React.useState(false);
  const [description, setDescription] = React.useState(media.description);
  const [isSaving, setIsSaving] = React.useState(false);
  const [focalPoint, setFocalPoint] = React.useState(
    ((media.type === 'image' || media.type === 'gifv') && media.meta.focus) || { x: 0, y: 0 },
  );

  const { width, height } =
    (media.type !== 'audio' && media.type !== 'unknown' && media.meta.original) || {};
  const aspectRatio = width && height ? width / height : undefined;
  const nodeRef = React.useRef<View | null>(null);
  const [dragging, setDragging] = React.useState(false);

  const handleTouchStart = (e: NativeSyntheticEvent<NativeTouchEvent>) => {
    if (!nodeRef.current) return;

    const { x, y } = getPointerPosition(nodeRef.current, e);
    setDragging(true);
    setFocalPoint({ x, y });
  };

  const handleTouchEnd = () => {
    setDragging(false);
  };

  const handleTouchMove = (e: NativeSyntheticEvent<NativeTouchEvent>) => {
    if (dragging && nodeRef.current) {
      const { x, y } = getPointerPosition(nodeRef.current, e);
      setFocalPoint({ x, y });
    }
  };

  const handleClose = () => setClosing(true);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      await changeUploadCompose(media.id, {
        description,
        focus: withFocalPoint ? `${focalPoint.x.toFixed(2)},${focalPoint.y.toFixed(2)}` : undefined,
      });
      setClosing(true);
    } catch {
      toast.error(intl.formatMessage(messages.savingFailed));
    }

    setIsSaving(false);
  };

  React.useEffect(() => {
    if (visible) setClosing(false);
  }, [visible]);

  return (
    <DialogOrSheet
      visible={visible && !closing}
      handleDismiss={onDismiss}
      title={<FormattedMessage id='alt_text_modal.header' defaultMessage='Add alt text' />}
      actions={[
        {
          icon: 'arrow.left',
          label: intl.formatMessage(messages.cancel),
          onPress: handleClose,
        },
        {
          icon: 'checkmark',
          label: intl.formatMessage(messages.save),
          onPress: handleSave,
          confirm: true,
          loading: isSaving,
          disabled: isSaving,
        },
      ]}
      forceSheet
      dismissible={!dragging}
    >
      <View style={{ gap: 8 }}>
        {media.type !== 'unknown' && media.type !== 'audio' ? (
          <View
            ref={nodeRef}
            style={{
              width: '100%',
              height: aspectRatio ? undefined : 320,
              aspectRatio,
              maxHeight: 480,
              position: 'relative',
              borderRadius: shapes.corner.medium,
              overflow: 'hidden',
            }}
            // onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
          >
            {renderMedia(media)}
            {withFocalPoint &&
              (glassEffect ? (
                <GlassView
                  style={{
                    borderRadius: 9999,
                    height: 64,
                    width: 64,
                    top: `${(focalPoint.y + 1) * 50}%`,
                    left: `${(focalPoint.x + 1) * 50}%`,
                    position: 'absolute',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.8,
                  }}
                  isInteractive
                  glassEffectStyle={{
                    style: 'clear',
                    animate: true,
                  }}
                />
              ) : (
                <View
                  style={{
                    borderRadius: 9999,
                    height: 64,
                    width: 64,
                    top: `${(focalPoint.y + 1) * 50}%`,
                    left: `${(focalPoint.x + 1) * 50}%`,
                    position: 'absolute',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.8,
                    backgroundColor: colors.surfaceContainer,
                    borderWidth: 2,
                    borderColor: colors.outline,
                  }}
                />
              ))}
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon
              source={iconHelper(
                MIMETYPE_ICONS[(media.type === 'unknown' && media.mime_type) || media.type] ??
                  PaperclipIcon,
              )}
              size={20}
            />
            <Text variant='bodyMedium' style={{ color: colors.onSurfaceVariant }} numberOfLines={1}>
              {media.url.split('/').at(-1)}
            </Text>
          </View>
        )}
        <Text variant='bodyMedium' style={{ color: colors.onSurfaceVariant }}>
          {intl.formatMessage(
            media.type === 'audio' ? messages.titleHearing : messages.titleVisual,
          )}
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          variant='outlined'
          placeholder={intl.formatMessage(messages.placeholder)}
          multiline
          numberOfLines={4}
        />
      </View>
    </DialogOrSheet>
  );
};

interface IComposeAttachmentThumb {
  composeId: string;
  media: MediaAttachment;
  index: number;
  mediaCount: number;
}

const ComposeAttachmentThumb: React.FC<IComposeAttachmentThumb> = ({
  composeId,
  media,
  index,
  mediaCount,
}) => {
  const intl = useIntl();
  const theme = useTheme();
  const { updateCompose } = useComposeActions();

  const [showEditor, setShowEditor] = React.useState(false);

  const handleDelete = () => {
    updateCompose(composeId, (draft) => {
      if (draft.mediaAttachments.length === 1) {
        draft.sensitive = false;
      }
      draft.mediaAttachments.splice(index, 1);
    });
  };

  const handleMove = (newIndex: number) => {
    updateCompose(composeId, (draft) => {
      const item = draft.mediaAttachments.splice(index, 1)[0];
      draft.mediaAttachments.splice(newIndex, 0, item);
    });
  };

  const thumb =
    media.type === 'audio' || media.type === 'unknown' ? (
      <View
        key={media.id}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          height: 64,
          width: 64,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
          borderRadius: theme.shapes.corner.medium,
        }}
      >
        <Icon
          source={iconHelper(
            MIMETYPE_ICONS[(media.type === 'unknown' && media.mime_type) || media.type] ??
              PaperclipIcon,
          )}
          size={24}
        />
      </View>
    ) : (
      <Image
        key={media.id}
        source={{ uri: media.preview_url }}
        placeholder={{ blurhash: (Platform.OS !== 'web' && media.blurhash) || undefined }}
        style={{ height: 64, width: 64, borderRadius: theme.shapes.corner.medium }}
      />
    );

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>{thumb}</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Label>{media.url.split('/').at(-1)}</DropdownMenu.Label>
          <DropdownMenu.Group>
            <DropdownMenu.Item key='edit' onSelect={() => setShowEditor(true)}>
              <DropdownMenu.ItemIcon ios={{ name: 'pencil' }} androidIconName='ph_pencil_simple' />
              <DropdownMenu.ItemTitle>{intl.formatMessage(messages.edit)}</DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
            <DropdownMenu.Item key='delete' onSelect={handleDelete} destructive>
              <DropdownMenu.ItemIcon ios={{ name: 'trash' }} androidIconName='ph_trash' />
              <DropdownMenu.ItemTitle>{intl.formatMessage(messages.delete)}</DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
          </DropdownMenu.Group>
          <DropdownMenu.Group>
            <DropdownMenu.Item
              key='move-left'
              onSelect={() => handleMove(index - 1)}
              disabled={index === 0}
            >
              <DropdownMenu.ItemIcon ios={{ name: 'arrow.left' }} androidIconName='ph_arrow_left' />
              <DropdownMenu.ItemTitle>
                {intl.formatMessage(messages.moveToLeft)}
              </DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              key='move-right'
              onSelect={() => handleMove(index + 1)}
              disabled={index === mediaCount - 1}
            >
              <DropdownMenu.ItemIcon
                ios={{ name: 'arrow.right' }}
                androidIconName='ph_arrow_right'
              />
              <DropdownMenu.ItemTitle>
                {intl.formatMessage(messages.moveToRight)}
              </DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      {showEditor && (
        <ComposeAttachmentEditor
          composeId={composeId}
          media={media}
          visible={showEditor}
          onDismiss={() => setShowEditor(false)}
        />
      )}
    </>
  );
};

const ComposeAttachmentThumbs: React.FC<ICompose> = ({ composeId }) => {
  const { mediaAttachments, isUploading } = useCompose(composeId);

  if (!mediaAttachments.length && !isUploading) return null;

  return (
    <View style={{ marginVertical: 8 }}>
      <ScrollView
        horizontal
        contentContainerStyle={{ height: 64, flexDirection: 'row', alignItems: 'center', gap: 8 }}
      >
        {mediaAttachments.map((media, index) => (
          <ComposeAttachmentThumb
            key={media.id}
            composeId={composeId}
            media={media}
            index={index}
            mediaCount={mediaAttachments.length}
          />
        ))}
        {/* TODO: Use CircularProgressIndicator when merged into react native paper */}
        {isUploading && <ActivityIndicator size='large' style={{ margin: 8 }} />}
      </ScrollView>
    </View>
  );
};

export { ComposeAttachmentThumbs, MIMETYPE_ICONS };
