import React, { Suspense, useCallback, useMemo } from 'react';

import { MediaGallery, Video, Audio } from '@/components/async-components';
import { CollectionCard } from '@/components/collections/collection-card';
import AttachmentThumbs from '@/components/media/attachment-thumbs';
import PlaceholderCard from '@/components/placeholders/placeholder-card';
import PreviewCard from '@/components/preview-card';
import { useAccount } from '@/queries/accounts/use-account';
import { useModalsActions } from '@/stores/modals';
import { usePictureInPictureActions } from '@/stores/picture-in-picture';
import { useSettings } from '@/stores/settings';

import { useMediaVisible } from './sensitive-content-overlay';

import type { NormalizedStatus as Status } from '@/queries/statuses/normalize';
import type { MediaAttachment, Translation } from 'pl-api';

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
    | 'tagged_collections'
    | 'visibility'
  >;
  /** Whether to display compact media. */
  muted?: boolean;
  /** Callback when compact media is clicked. */
  onClick?: () => void;
  translatedAttachments?: Translation['media_attachments'];
}

/** Render media attachments for a status. */
const StatusMedia: React.FC<IStatusMedia> = ({
  status,
  muted = false,
  onClick,
  translatedAttachments,
}) => {
  const { openModal } = useModalsActions();
  const { deployPictureInPicture } = usePictureInPictureActions();
  const { displayMedia, disableUserProvidedMedia } = useSettings();
  const { data: account } = useAccount(status.account_id);

  const [visible] = useMediaVisible(status, displayMedia);

  const handleDeployPictureInPicture = useCallback(
    (type: string, opts: Record<string, any>) => {
      deployPictureInPicture({
        type: type as 'audio' | 'video',
        statusId: status.id,
        accountId: status.account_id,
        ...opts,
      });
    },
    [deployPictureInPicture, status.id, status.account_id],
  );

  const mediaAttachments = useMemo(() => {
    const descriptions = new Map(
      translatedAttachments?.map(({ id, description }) => [id, description]),
    );

    return status.media_attachments.map((attachment) => {
      const description = descriptions.get(attachment.id);
      return description === undefined ? attachment : { ...attachment, description };
    });
  }, [status.media_attachments, translatedAttachments]);

  const translatedStatus = useMemo(
    () => ({ ...status, media_attachments: mediaAttachments }),
    [mediaAttachments, status],
  );
  const size = mediaAttachments.length;
  const firstAttachment = mediaAttachments[0];

  let media: React.JSX.Element | null = null;

  const renderLoadingMediaGallery = (): React.JSX.Element => <div style={{ height: '285px' }} />;

  const renderLoadingVideoPlayer = (): React.JSX.Element => (
    <div className='status-media__loading-player' style={{ height: '285px' }} />
  );

  const renderLoadingAudioPlayer = (): React.JSX.Element => (
    <div className='status-media__loading-player' style={{ height: '285px' }} />
  );

  const openMedia = (media: Array<MediaAttachment>, index: number) => {
    openModal('MEDIA', { media, statusId: status.id, index });
  };

  if (size > 0 && firstAttachment) {
    if (muted) {
      media = <AttachmentThumbs status={translatedStatus} onClick={onClick} />;
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
            deployPictureInPicture={handleDeployPictureInPicture}
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
            deployPictureInPicture={handleDeployPictureInPicture}
          />
        </Suspense>
      );
    } else {
      media = (
        <Suspense fallback={renderLoadingMediaGallery()}>
          <MediaGallery
            media={mediaAttachments}
            height={285}
            onOpenMedia={openMedia}
            visible={visible}
          />
        </Suspense>
      );
    }
  } else if (
    (!status.quote_id || status.quote_visible === false) &&
    (status.card || status.tagged_collections?.length)
  ) {
    if (status.tagged_collections?.length) {
      media = (
        <div className='collection-notification'>
          <CollectionCard collection={status.tagged_collections[0]} />
        </div>
      );
    } else {
      media = <PreviewCard onOpenMedia={openMedia} card={status.card!} compact />;
    }
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
