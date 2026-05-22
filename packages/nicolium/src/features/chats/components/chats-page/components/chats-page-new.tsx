import iconArrowLeft from '@phosphor-icons/core/regular/arrow-left.svg';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { CardTitle } from '@/components/ui/card';
import IconButton from '@/components/ui/icon-button';

import ChatSearch from '../../chat-search/chat-search';

const messages = defineMessages({
  title: { id: 'chat.new_message.title', defaultMessage: 'New message' },
  back: { id: 'chats.back', defaultMessage: 'Back to chats' },
});

/** New message form to create a chat. */
const ChatsPageNew: React.FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();

  return (
    <div className='⁂-chats-page-panel'>
      <div className='⁂-chats-page-panel__header'>
        <IconButton
          src={iconArrowLeft}
          className='⁂-chats-page-panel__back-button'
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
