import React from 'react';

import ProgressBar from '@/components/ui/progress-bar';

interface IChatPendingUpload {
  progress: number;
}

/** Displays a loading thumbnail for an upload in the chat composer. */
const ChatPendingUpload: React.FC<IChatPendingUpload> = ({ progress }) => (
  <div className='chat-upload chat-upload--pending'>
    <ProgressBar progress={progress} size='sm' />
  </div>
);

export { ChatPendingUpload as default };
