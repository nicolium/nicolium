import iconX from '@phosphor-icons/core/regular/x.svg';
import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Blurhash from '@/components/media/blurhash';
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
    <div className='⁂-chat-upload'>
      <Blurhash hash={attachment.blurhash} className='⁂-chat-upload__blurhash' />

      <div className='⁂-chat-upload__remove'>
        <RemoveButton onClick={onDelete} />
      </div>

      <button
        onClick={clickable ? handleOpenModal : undefined}
        className={clsx('⁂-chat-upload__button', {
          '⁂-chat-upload__button--clickable': clickable,
          '⁂-chat-upload__button--static': !clickable,
        })}
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
      className='⁂-chat-upload__remove-button'
      aria-label={intl.formatMessage(messages.removeAttachment)}
    >
      <Icon src={iconX} />
    </button>
  );
};

export { ChatUpload as default };
