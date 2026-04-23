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
    <div
      className={`block w-full rounded-md border border-gray-400 bg-white text-gray-900 shadow-sm placeholder:text-gray-600 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:ring-1 dark:ring-gray-800 dark:placeholder:text-gray-600 dark:focus-within:border-primary-500 dark:focus-within:ring-primary-500 sm:text-sm`}
    >
      {(attachment ?? uploading) && (
        <div className='-ml-2 -mt-2 flex flex-wrap p-3 pb-0'>
          {attachment && (
            <div className='ml-2 mt-2 flex'>
              <ChatUpload
                key={attachment.id}
                attachment={attachment}
                onDelete={onDeleteAttachment}
              />
            </div>
          )}

          {uploading && (
            <div className='ml-2 mt-2 flex'>
              <ChatPendingUpload progress={uploadProgress} />
            </div>
          )}
        </div>
      )}

      <Textarea className='px-3 py-2' ref={ref} theme='transparent' {...rest} />
    </div>
  ),
);

ChatTextarea.displayName = 'ChatTextarea';

export { ChatTextarea as default };
