import noop from 'lodash/noop';
import React, { Suspense } from 'react';

import StatusContent from '@/components/statuses/status-content';
import Toggle from '@/components/ui/toggle';
import { MediaGallery, Video, Audio } from '@/features/ui/util/async-components';
import { useMinimalStatus } from '@/queries/statuses/use-status';

interface IStatusCheckBox {
  id: string;
  disabled?: boolean;
  toggleStatusReport: (value: boolean) => void;
  checked: boolean;
}

const StatusCheckBox: React.FC<IStatusCheckBox> = ({
  id,
  disabled,
  checked,
  toggleStatusReport,
}) => {
  const { data: status } = useMinimalStatus(id);

  const onToggle: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    toggleStatusReport(e.target.checked);
  };

  if (!status || status.reblog_id) {
    return null;
  }

  let media;

  if (status.media_attachments.length > 0) {
    if (status.media_attachments.some((item) => item.type === 'unknown')) {
      // Do nothing
    } else if (status.media_attachments[0]?.type === 'video') {
      const video = status.media_attachments[0];

      if (video) {
        media = (
          <Video
            preview={video.preview_url}
            blurhash={video.blurhash}
            src={video.url}
            alt={video.description}
            aspectRatio={video.meta.original?.aspect as number | undefined}
            width={239}
            height={110}
            inline
          />
        );
      }
    } else if (status.media_attachments[0]?.type === 'audio') {
      const audio = status.media_attachments[0];

      if (audio) {
        media = <Audio src={audio.url} alt={audio.description} />;
      }
    } else {
      media = <MediaGallery media={status.media_attachments} height={110} onOpenMedia={noop} />;
    }
  }

  return (
    <div className='status-check-box'>
      <div className='status-check-box__status'>
        <StatusContent status={status} />
        <Suspense>{media}</Suspense>
      </div>

      <div className='status-check-box__toggle'>
        <Toggle checked={checked} onChange={onToggle} disabled={disabled} />
      </div>
    </div>
  );
};

export { StatusCheckBox as default };
