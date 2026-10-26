import { ActivityIndicator, Icon, useTheme } from '@mkljczk/react-native-paper';
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
import { defineMessages, useIntl } from 'react-intl';
import { Platform, ScrollView, View } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { useCompose, useComposeActions } from '@/stores/compose';

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
});

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
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>{thumb}</DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Label>{media.url.split('/').at(-1)}</DropdownMenu.Label>
        <DropdownMenu.Group>
          <DropdownMenu.Item key='edit' onSelect={() => {}}>
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
            <DropdownMenu.ItemIcon ios={{ name: 'arrow.right' }} androidIconName='ph_arrow_right' />
            <DropdownMenu.ItemTitle>
              {intl.formatMessage(messages.moveToRight)}
            </DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
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

export { ComposeAttachmentThumbs };
