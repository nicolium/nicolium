import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Blurhash from '@/components/blurhash';
import Icon from '@/components/ui/icon';
import { useModalsActions } from '@/stores/modals';

import ChatUploadPreview from './chat-upload-preview';

import type { MediaAttachment } from 'pl-api';

const messages = defineMessages({
  removeAttachment: { id: 'chat.actions.remove_attachment', defaultMessage: 'Remove attachment' },
});

interface IChatUpload {
  attachment: MediaAttachment;
  onDelete?(): void;
}

/** An attachment uploaded to the chat composer, before sending. */
const ChatUpload: React.FC<IChatUpload> = ({ attachment, onDelete }) => {
  const { openModal } = useModalsActions();
  const clickable = attachment.type !== 'unknown';

  const handleOpenModal = () => {
    openModal('MEDIA', { media: [attachment], index: 0 });
  };

  return (
    <div className='relative isolate inline-block size-24 overflow-hidden rounded-lg bg-gray-200 dark:bg-primary-900'>
      <Blurhash hash={attachment.blurhash} className='absolute inset-0 -z-10 size-full' />

      <div className='absolute right-[6px] top-[6px]'>
        <RemoveButton onClick={onDelete} />
      </div>

      <button
        onClick={clickable ? handleOpenModal : undefined}
        className={clsx('size-full', { 'cursor-zoom-in': clickable, 'cursor-default': !clickable })}
      >
        <ChatUploadPreview attachment={attachment} />
      </button>
    </div>
  );
};

interface IRemoveButton {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

/** Floating button to remove an attachment. */
const RemoveButton: React.FC<IRemoveButton> = ({ onClick }) => {
  const intl = useIntl();

  return (
    <button
      type='button'
      onClick={onClick}
      className='flex size-5 items-center justify-center rounded-full bg-secondary-500 p-1'
      aria-label={intl.formatMessage(messages.removeAttachment)}
    >
      <Icon className='size-3 text-white' src={require('@phosphor-icons/core/regular/x.svg')} />
    </button>
  );
};

export { ChatUpload as default };
