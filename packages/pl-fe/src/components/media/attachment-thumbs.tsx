import React, { Suspense } from 'react';

import { MediaGallery } from '@/features/ui/util/async-components';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';

import { useMediaVisible } from '../statuses/sensitive-content-overlay';

import type { NormalizedStatus as Status } from '@/reducers/statuses';
import type { MediaAttachment } from 'pl-api';

interface IAttachmentThumbs {
  status: Pick<Status, 'media_attachments' | 'sensitive'> &
    Partial<Pick<Status, 'filtered' | 'id'>>;
  onClick?(): void;
}

const AttachmentThumbs = ({ status, onClick }: IAttachmentThumbs) => {
  const { displayMedia } = useSettings();
  const { openModal } = useModalsActions();

  const fallback = <div className='⁂-media-gallery--compact' />;
  const onOpenMedia = (media: Array<MediaAttachment>, index: number) => {
    openModal('MEDIA', { statusId: status.id, media, index });
  };

  const [visible] = useMediaVisible(status, displayMedia);

  return (
    <div className='relative'>
      <Suspense fallback={fallback}>
        <MediaGallery
          media={status.media_attachments}
          onOpenMedia={onOpenMedia}
          height={50}
          compact
          visible={visible}
        />
      </Suspense>

      {onClick && <div className='absolute inset-0 size-full cursor-pointer' onClick={onClick} />}
    </div>
  );
};

export { AttachmentThumbs as default };
