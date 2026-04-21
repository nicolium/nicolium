import React, { Suspense } from 'react';

import AttachmentThumbs from '@/components/media/attachment-thumbs';
import PlaceholderCard from '@/components/placeholders/placeholder-card';
import PreviewCard from '@/components/preview-card';
import { MediaGallery, Video, Audio } from '@/features/ui/util/async-components';
import { useAccount } from '@/queries/accounts/use-account';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';

import { useMediaVisible } from './sensitive-content-overlay';

import type { NormalizedStatus as Status } from '@/queries/statuses/normalize';
import type { MediaAttachment } from 'pl-api';

interface IStatusMedia {
  /** Status entity to render media for. */
  status: Pick<
    Status,
    | 'id'
    | 'account_id'
    | 'card'
    | 'expectsCard'
    | 'filtered'
    | 'media_attachments'
    | 'quote_id'
    | 'quote_visible'
    | 'sensitive'
    | 'visibility'
  >;
  /** Whether to display compact media. */
  muted?: boolean;
  /** Callback when compact media is clicked. */
  onClick?: () => void;
}

/** Render media attachments for a status. */
const StatusMedia: React.FC<IStatusMedia> = ({ status, muted = false, onClick }) => {
  const { openModal } = useModalsActions();
  const { displayMedia, disableUserProvidedMedia } = useSettings();
  const { data: account } = useAccount(status.account_id);

  const [visible] = useMediaVisible(status, displayMedia);

  const size = status.media_attachments.length;
  const firstAttachment = status.media_attachments[0];

  let media: React.JSX.Element | null = null;

  const renderLoadingMediaGallery = (): React.JSX.Element => (
    <div className='media_gallery' style={{ height: '285px' }} />
  );

  const renderLoadingVideoPlayer = (): React.JSX.Element => (
    <div
      className='relative mt-2 block cursor-pointer border-0 bg-cover bg-center bg-no-repeat'
      style={{ height: '285px' }}
    />
  );

  const renderLoadingAudioPlayer = (): React.JSX.Element => (
    <div
      className='relative mt-2 block cursor-pointer border-0 bg-cover bg-center bg-no-repeat'
      style={{ height: '285px' }}
    />
  );

  const openMedia = (media: Array<MediaAttachment>, index: number) => {
    openModal('MEDIA', { media, statusId: status.id, index });
  };

  if (size > 0 && firstAttachment) {
    if (muted) {
      media = <AttachmentThumbs status={status} onClick={onClick} />;
    } else if (size === 1 && firstAttachment.type === 'video' && !disableUserProvidedMedia) {
      const video = firstAttachment;

      media = (
        <Suspense fallback={renderLoadingVideoPlayer()}>
          <Video
            preview={video.preview_url}
            blurhash={video.blurhash}
            src={video.url}
            alt={video.description}
            aspectRatio={Number(video.meta.original?.aspect)}
            height={285}
            visible={visible}
            inline
          />
        </Suspense>
      );
    } else if (size === 1 && firstAttachment.type === 'audio' && !disableUserProvidedMedia) {
      const attachment = firstAttachment;

      media = (
        <Suspense fallback={renderLoadingAudioPlayer()}>
          <Audio
            src={attachment.url}
            alt={attachment.description}
            poster={
              attachment.preview_url !== attachment.url
                ? attachment.preview_url
                : account?.avatar_static
            }
            backgroundColor={attachment.meta.colors?.background}
            foregroundColor={attachment.meta.colors?.foreground}
            accentColor={attachment.meta.colors?.accent}
            duration={attachment.meta.original?.duration ?? 0}
          />
        </Suspense>
      );
    } else {
      media = (
        <Suspense fallback={renderLoadingMediaGallery()}>
          <MediaGallery
            media={status.media_attachments}
            height={285}
            onOpenMedia={openMedia}
            visible={visible}
          />
        </Suspense>
      );
    }
  } else if ((!status.quote_id || !status.quote_visible) && status.card) {
    media = <PreviewCard onOpenMedia={openMedia} card={status.card} compact />;
  } else if (status.expectsCard) {
    media = <PlaceholderCard />;
  }

  if (media) {
    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div onClick={(e) => e.stopPropagation()}>{media}</div>
    );
  } else {
    return null;
  }
};

export { StatusMedia as default };
