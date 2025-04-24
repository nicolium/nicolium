import bookIcon from '@tabler/icons/outline/book.svg';
import fileCodeIcon from '@tabler/icons/outline/file-code.svg';
import fileSpreadsheetIcon from '@tabler/icons/outline/file-spreadsheet.svg';
import fileTextIcon from '@tabler/icons/outline/file-text.svg';
import fileZipIcon from '@tabler/icons/outline/file-zip.svg';
import audioIcon from '@tabler/icons/outline/music.svg';
import defaultIcon from '@tabler/icons/outline/paperclip.svg';
import editIcon from '@tabler/icons/outline/pencil.svg';
import imageIcon from '@tabler/icons/outline/photo.svg';
import presentationIcon from '@tabler/icons/outline/presentation.svg';
import videoIcon from '@tabler/icons/outline/video.svg';
import xIcon from '@tabler/icons/outline/x.svg';
import zoomInIcon from '@tabler/icons/outline/zoom-in.svg';
import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { spring } from 'react-motion';

import AltIndicator from 'pl-fe/components/alt-indicator';
import Blurhash from 'pl-fe/components/blurhash';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import IconButton from 'pl-fe/components/ui/icon-button';
import Motion from 'pl-fe/features/ui/util/optional-motion';
import { useModalsStore } from 'pl-fe/stores/modals';

import type { MediaAttachment } from 'pl-api';

const MIMETYPE_ICONS: Record<string, string> = {
  'application/x-freearc': fileZipIcon,
  'application/x-bzip': fileZipIcon,
  'application/x-bzip2': fileZipIcon,
  'application/gzip': fileZipIcon,
  'application/vnd.rar': fileZipIcon,
  'application/x-tar': fileZipIcon,
  'application/zip': fileZipIcon,
  'application/x-7z-compressed': fileZipIcon,
  'application/x-csh': fileCodeIcon,
  'application/html': fileCodeIcon,
  'text/javascript': fileCodeIcon,
  'application/json': fileCodeIcon,
  'application/ld+json': fileCodeIcon,
  'application/x-httpd-php': fileCodeIcon,
  'application/x-sh': fileCodeIcon,
  'application/xhtml+xml': fileCodeIcon,
  'application/xml': fileCodeIcon,
  'application/epub+zip': bookIcon,
  'application/vnd.oasis.opendocument.spreadsheet': fileSpreadsheetIcon,
  'application/vnd.ms-excel': fileSpreadsheetIcon,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': fileSpreadsheetIcon,
  'application/pdf': fileTextIcon,
  'application/vnd.oasis.opendocument.presentation': presentationIcon,
  'application/vnd.ms-powerpoint': presentationIcon,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': presentationIcon,
  'text/plain': fileTextIcon,
  'application/rtf': fileTextIcon,
  'application/msword': fileTextIcon,
  'application/x-abiword': fileTextIcon,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': fileTextIcon,
  'application/vnd.oasis.opendocument.text': fileTextIcon,
  image: imageIcon,
  video: videoIcon,
  gifv: videoIcon,
  audio: audioIcon,
};

const messages = defineMessages({
  description: { id: 'upload_form.description', defaultMessage: 'Describe for the visually impaired' },
  delete: { id: 'upload_form.undo', defaultMessage: 'Delete' },
  preview: { id: 'upload_form.preview', defaultMessage: 'Preview' },
  descriptionMissingTitle: { id: 'upload_form.description_missing.title', defaultMessage: 'This attachment doesn\'t have a description' },
});

interface IUpload extends Pick<React.HTMLAttributes<HTMLDivElement>, 'onDragStart' | 'onDragEnter' | 'onDragEnd'> {
  media: MediaAttachment;
  onSubmit?(): void;
  onDelete?(): void;
  onDescriptionChange?(description: string, position: [number, number]): Promise<void>;
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
  const { openModal } = useModalsStore();

  const handleUndoClick: React.MouseEventHandler = e => {
    if (onDelete) {
      e.stopPropagation();
      onDelete();
    }
  };

  const handleOpenModal = () => {
    openModal('MEDIA', { media: [media], index: 0 });
  };

  const handleOpenAltTextModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    if (!onDescriptionChange) return;

    const focusX = (media.type === 'image' || media.type === 'gifv') && media.meta.focus?.x || 0;
    const focusY = (media.type === 'image' || media.type === 'gifv') && media.meta.focus?.y || 0;

    openModal('ALT_TEXT', {
      media,
      withPosition: !!onDragStart,
      previousDescription: media.description,
      previousPosition: [focusX / 2 + 0.5, focusY / -2 + 0.5],
      descriptionLimit: descriptionLimit!,
      onSubmit: (newDescription: string, newPosition: [number, number]) => onDescriptionChange(newDescription, newPosition),
    });
  };

  const description = media.description;
  const focusX = media.type === 'image' && media.meta?.focus?.x || undefined;
  const focusY = media.type === 'image' && media.meta?.focus?.y || undefined;
  const x = focusX ? ((focusX / 2) + .5) * 100 : undefined;
  const y = focusY ? ((focusY / -2) + .5) * 100 : undefined;
  const mediaType = media.type;
  const mimeType = media.mime_type as string | undefined;

  const uploadIcon = mediaType === 'unknown' && (
    <Icon
      className='mx-auto my-12 size-16 text-gray-800 dark:text-gray-200'
      src={MIMETYPE_ICONS[mimeType || ''] || defaultIcon}
    />
  );

  return (
    <div
      className='relative m-[5px] min-w-[40%] flex-1 overflow-hidden rounded'
      tabIndex={0}
      role='button'
      draggable
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
    >
      <Blurhash hash={media.blurhash} className='media-gallery__preview' />
      <Motion defaultStyle={{ scale: 0.8 }} style={{ scale: spring(1, { stiffness: 180, damping: 12 }) }}>
        {({ scale }) => (
          <div
            className={clsx('compose-form__upload-thumbnail relative h-40 w-full overflow-hidden bg-contain bg-center bg-no-repeat', mediaType)}
            style={{
              transform: `scale(${scale})`,
              backgroundImage: mediaType === 'image' ? `url(${media.preview_url})` : undefined,
              backgroundPosition: typeof x === 'number' && typeof y === 'number' ? `${x}% ${y}%` : undefined,
            }}
          >
            <HStack className='absolute right-2 top-2 z-10' space={2}>
              {onDescriptionChange && (
                <IconButton
                  onClick={handleOpenAltTextModal}
                  src={editIcon}
                  theme='dark'
                  className='hover:scale-105 hover:bg-gray-900'
                  iconClassName='h-5 w-5'
                  title={intl.formatMessage(messages.description)}
                />
              )}
              {(withPreview && mediaType !== 'unknown' && Boolean(media.url)) && (
                <IconButton
                  onClick={handleOpenModal}
                  src={zoomInIcon}
                  theme='dark'
                  className='hover:scale-105 hover:bg-gray-900'
                  iconClassName='h-5 w-5'
                  title={intl.formatMessage(messages.preview)}
                />
              )}
              {onDelete && (
                <IconButton
                  onClick={handleUndoClick}
                  src={xIcon}
                  theme='dark'
                  className='hover:scale-105 hover:bg-gray-900'
                  iconClassName='h-5 w-5'
                  title={intl.formatMessage(messages.delete)}
                />
              )}
            </HStack>

            <HStack space={2} justifyContent='between' className='absolute inset-x-2 bottom-2 z-10'>
              <span className='overflow-hidden text-ellipsis rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white'>
                {media.url.split('/').at(-1)}
              </span>

              {onDescriptionChange && !description && (
                <button onClick={handleOpenAltTextModal}>
                  <AltIndicator
                    warning
                    title={intl.formatMessage(messages.descriptionMissingTitle)}
                  />
                </button>
              )}
            </HStack>

            <div className='absolute inset-0 z-[-1] size-full'>
              {mediaType === 'video' && (
                <video className='size-full object-cover' autoPlay playsInline muted loop>
                  <source src={media.preview_url} />
                </video>
              )}
              {uploadIcon}
            </div>
          </div>
        )}
      </Motion>
    </div>
  );
};

export {
  MIMETYPE_ICONS,
  Upload as default,
};
