import defaultIcon from '@phosphor-icons/core/regular/paperclip.svg';
import React from 'react';

import Icon from '@/components/ui/icon';
import { MIMETYPE_ICONS } from '@/components/upload';

import type { MediaAttachment } from 'pl-api';

interface IChatUploadPreview {
  className?: string;
  attachment: MediaAttachment;
}

/**
 * Displays a generic preview for an upload depending on its media type.
 * It fills its container and is expected to be sized by its parent.
 */
const ChatUploadPreview: React.FC<IChatUploadPreview> = ({ attachment }) => {
  const mimeType = attachment.mime_type as string | undefined;

  switch (attachment.type) {
    case 'image':
    case 'gifv':
      return <img className='chat-upload-preview' src={attachment.preview_url} alt='' />;
    case 'video':
      return (
        <video
          className='chat-upload-preview'
          src={attachment.preview_url}
          autoPlay
          playsInline
          controls={false}
          muted
          loop
        />
      );
    default:
      return (
        <div className='chat-upload-preview__fallback'>
          <Icon src={MIMETYPE_ICONS[mimeType ?? ''] || defaultIcon} />
        </div>
      );
  }
};

export { ChatUploadPreview as default };
