import bookIcon from '@phosphor-icons/core/regular/book.svg';
import fileArchiveIcon from '@phosphor-icons/core/regular/file-archive.svg';
import fileCodeIcon from '@phosphor-icons/core/regular/file-code.svg';
import fileCSSIcon from '@phosphor-icons/core/regular/file-css.svg';
import fileDocIcon from '@phosphor-icons/core/regular/file-doc.svg';
import fileHtmlIcon from '@phosphor-icons/core/regular/file-html.svg';
import fileJSIcon from '@phosphor-icons/core/regular/file-js.svg';
import filePdfIcon from '@phosphor-icons/core/regular/file-pdf.svg';
import filePptIcon from '@phosphor-icons/core/regular/file-ppt.svg';
import filePythonIcon from '@phosphor-icons/core/regular/file-py.svg';
import fileTextIcon from '@phosphor-icons/core/regular/file-text.svg';
import fileXlsIcon from '@phosphor-icons/core/regular/file-xls.svg';
import fileZipIcon from '@phosphor-icons/core/regular/file-zip.svg';
import imageIcon from '@phosphor-icons/core/regular/image.svg';
import zoomInIcon from '@phosphor-icons/core/regular/magnifying-glass-plus.svg';
import audioIcon from '@phosphor-icons/core/regular/music-notes-simple.svg';
import defaultIcon from '@phosphor-icons/core/regular/paperclip.svg';
import editIcon from '@phosphor-icons/core/regular/pencil-simple.svg';
import presentationIcon from '@phosphor-icons/core/regular/presentation.svg';
import spreadsheetIcon from '@phosphor-icons/core/regular/table.svg';
import videoIcon from '@phosphor-icons/core/regular/video.svg';
import xIcon from '@phosphor-icons/core/regular/x.svg';
import { animated, config, useSpring } from '@react-spring/web';
import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import AltIndicator from '@/components/media/alt-indicator';
import Blurhash from '@/components/media/blurhash';
import Icon from '@/components/ui/icon';
import IconButton from '@/components/ui/icon-button';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';

import type { MediaAttachment } from 'pl-api';

const MIMETYPE_ICONS: Record<string, string> = {
  'application/x-freearc': fileArchiveIcon,
  'application/x-bzip': fileArchiveIcon,
  'application/x-bzip2': fileArchiveIcon,
  'application/gzip': fileArchiveIcon,
  'application/vnd.rar': fileArchiveIcon,
  'application/x-tar': fileArchiveIcon,
  'application/zip': fileZipIcon,
  'application/x-7z-compressed': fileArchiveIcon,
  'application/x-csh': fileCSSIcon,
  'application/html': fileHtmlIcon,
  'text/javascript': fileJSIcon,
  'application/javascript': fileJSIcon,
  'application/json': fileCodeIcon,
  'application/ld+json': fileCodeIcon,
  'application/x-httpd-php': fileCodeIcon,
  'application/x-sh': fileCodeIcon,
  'application/xhtml+xml': fileCodeIcon,
  'application/xml': fileCodeIcon,
  'text/x-script.python': filePythonIcon,
  'application/epub+zip': bookIcon,
  'application/vnd.oasis.opendocument.spreadsheet': spreadsheetIcon,
  'application/vnd.ms-excel': fileXlsIcon,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': fileXlsIcon,
  'application/pdf': filePdfIcon,
  'application/vnd.oasis.opendocument.presentation': presentationIcon,
  'application/vnd.ms-powerpoint': filePptIcon,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': presentationIcon,
  'text/plain': fileTextIcon,
  'application/rtf': fileTextIcon,
  'application/msword': fileDocIcon,
  'application/x-abiword': fileTextIcon,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': fileDocIcon,
  'application/vnd.oasis.opendocument.text': fileTextIcon,
  image: imageIcon,
  video: videoIcon,
  gifv: videoIcon,
  audio: audioIcon,
};

const messages = defineMessages({
  description: {
    id: 'upload_form.description',
    defaultMessage: 'Describe for the visually impaired',
  },
  delete: { id: 'upload_form.undo', defaultMessage: 'Delete' },
  preview: { id: 'upload_form.preview', defaultMessage: 'Preview' },
  descriptionMissingTitle: {
    id: 'upload_form.description_missing.title',
    defaultMessage: 'This attachment doesn’t have a description',
  },
});

interface IUpload extends Pick<
  React.HTMLAttributes<HTMLDivElement>,
  'onDragStart' | 'onDragEnter' | 'onDragEnd'
> {
  media: MediaAttachment;
  onSubmit?(): void;
  onDelete?(): void;
  onDescriptionChange?(description: string, position: [number, number]): Promise<any>;
  descriptionLimit?: number;
  withPreview?: boolean;
}

const Upload: React.FC<IUpload> = ({
  media,
  onDelete,
  onDescriptionChange,
  onDragStart,
  onDragEnter,
  onDragEnd,
  descriptionLimit,
  withPreview = true,
}) => {
  const intl = useIntl();
  const { openModal } = useModalsActions();
  const { reduceMotion } = useSettings();

  const handleUndoClick: React.MouseEventHandler = (e) => {
    if (onDelete) {
      e.stopPropagation();
      onDelete();
    }
  };

  const handleOpenModal = () => {
    openModal('MEDIA', { media: [media], index: 0 });
  };

  const handleOpenAltTextModal: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!onDescriptionChange) return;

    const focusX = media.type === 'image' || media.type === 'gifv' ? (media.meta.focus?.x ?? 0) : 0;
    const focusY = media.type === 'image' || media.type === 'gifv' ? (media.meta.focus?.y ?? 0) : 0;

    openModal('ALT_TEXT', {
      media,
      previousDescription: media.description,
      previousPosition: [focusX / 2 + 0.5, focusY / -2 + 0.5],
      descriptionLimit: descriptionLimit!,
      onSubmit: (newDescription: string, newPosition: [number, number]) =>
        onDescriptionChange(newDescription, newPosition),
    });
  };

  const description = media.description;
  const focusX = (media.type === 'image' && media.meta?.focus?.x) ?? undefined;
  const focusY = (media.type === 'image' && media.meta?.focus?.y) ?? undefined;
  const x = focusX ? (focusX / 2 + 0.5) * 100 : undefined;
  const y = focusY ? (focusY / -2 + 0.5) * 100 : undefined;
  const mediaType = media.type;
  const mimeType = media.mime_type as string | undefined;

  const styles = useSpring({
    backgroundImage: mediaType === 'image' ? `url(${media.preview_url})` : undefined,
    backgroundPosition: typeof x === 'number' && typeof y === 'number' ? `${x}% ${y}%` : undefined,
    from: { scale: 0.8 },
    to: { scale: 1 },
    config: config.stiff,
    immediate: reduceMotion,
  });

  const uploadIcon = mediaType === 'unknown' && (
    <Icon src={MIMETYPE_ICONS[mimeType ?? ''] || defaultIcon} />
  );

  const backgroundImage =
    mediaType === 'image' ||
    ['.png', '.jpg', '.jpeg'].some((ext) => media.preview_url.endsWith(ext))
      ? `url(${media.preview_url})`
      : undefined;
  const hasBackgroundImage = !!backgroundImage;

  return (
    <div
      className='compose-form__upload'
      tabIndex={0}
      role='button'
      draggable
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
    >
      <Blurhash hash={media.blurhash} className='media-gallery__preview' />
      <animated.div
        className={clsx('compose-form__upload-thumbnail', {
          'compose-form__upload-thumbnail--video': mediaType === 'video' || mediaType === 'gifv',
          'compose-form__upload-thumbnail--audio': mediaType === 'audio',
        })}
        style={{
          scale: styles.scale,
          backgroundImage,
          backgroundPosition:
            typeof x === 'number' && typeof y === 'number' ? `${x}% ${y}%` : undefined,
        }}
      >
        <div className='compose-form__upload__actions'>
          {onDescriptionChange && (
            <IconButton
              onClick={handleOpenAltTextModal}
              src={editIcon}
              theme='dark'
              title={intl.formatMessage(messages.description)}
            />
          )}
          {withPreview && mediaType !== 'unknown' && Boolean(media.url) && (
            <IconButton
              onClick={handleOpenModal}
              src={zoomInIcon}
              theme='dark'
              title={intl.formatMessage(messages.preview)}
            />
          )}
          {onDelete && (
            <IconButton
              onClick={handleUndoClick}
              src={xIcon}
              theme='dark'
              title={intl.formatMessage(messages.delete)}
            />
          )}
        </div>

        <div className='compose-form__upload__footer'>
          <span className='compose-form__upload__name' title={media.url}>
            {media.url.split('/').at(-1)}
          </span>

          {onDescriptionChange && !description && (
            <button
              onClick={handleOpenAltTextModal}
              title={intl.formatMessage(messages.descriptionMissingTitle)}
            >
              <AltIndicator warning />
            </button>
          )}
        </div>

        <div
          className={clsx('compose-form__upload__preview', {
            'compose-form__upload__preview--with-background': hasBackgroundImage,
          })}
        >
          {mediaType === 'video' && (
            <video autoPlay playsInline muted loop>
              <source src={media.preview_url} />
            </video>
          )}
          {uploadIcon}
        </div>
      </animated.div>
    </div>
  );
};

export { MIMETYPE_ICONS, Upload as default };
