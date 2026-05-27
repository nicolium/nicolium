import React from 'react';

import Textarea from '@/components/ui/textarea';

import ChatPendingUpload from './chat-pending-upload';
import ChatUpload from './chat-upload';

import type { MediaAttachment } from 'pl-api';

interface IChatTextarea extends React.ComponentProps<typeof Textarea> {
  attachment?: MediaAttachment | null;
  onDeleteAttachment?: () => void;
  uploading?: boolean;
  uploadProgress?: number;
}

/** Custom textarea for chats. */
const ChatTextarea = React.forwardRef<HTMLTextAreaElement, IChatTextarea>(
  ({ attachment, onDeleteAttachment, uploading, uploadProgress = 0, ...rest }, ref) => (
    <div className='chat-textarea'>
      {(attachment ?? uploading) && (
        <div className='chat-textarea__attachments'>
          {attachment && (
            <div className='chat-textarea__attachment'>
              <ChatUpload
                key={attachment.id}
                attachment={attachment}
                onDelete={onDeleteAttachment}
              />
            </div>
          )}

          {uploading && (
            <div className='chat-textarea__attachment'>
              <ChatPendingUpload progress={uploadProgress} />
            </div>
          )}
        </div>
      )}

      <Textarea className='chat-textarea__input' ref={ref} theme='transparent' {...rest} />
    </div>
  ),
);

ChatTextarea.displayName = 'ChatTextarea';

export { ChatTextarea as default };
