import iconArrowLeft from '@phosphor-icons/core/regular/arrow-left.svg';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { CardTitle } from '@/components/ui/card';
import IconButton from '@/components/ui/icon-button';

import ChatSearch from '../../chat-search/chat-search';

const messages = defineMessages({
  title: { id: 'chat.new_message.title', defaultMessage: 'New Message' },
  back: { id: 'chats.back', defaultMessage: 'Back to chats' },
});

/** New message form to create a chat. */
const ChatsPageNew: React.FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();

  return (
    <div className='flex h-full flex-col gap-4'>
      <div className='flex items-center px-4 pt-6 sm:px-6'>
        <IconButton
          src={iconArrowLeft}
          className='mr-2 size-7 sm:mr-0 sm:hidden rtl:rotate-180'
          onClick={() => navigate({ to: '/chats' })}
          title={intl.formatMessage(messages.back)}
        />

        <CardTitle title={intl.formatMessage(messages.title)} />
      </div>

      <ChatSearch isMainPage />
    </div>
  );
};

export { ChatsPageNew as default };
