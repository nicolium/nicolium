import iconPencilSimple from '@phosphor-icons/core/regular/pencil-simple.svg';
import iconSlidersHorizontal from '@phosphor-icons/core/regular/sliders-horizontal.svg';
import { useNavigate } from '@tanstack/react-router';
import React, { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { CardTitle } from '@/components/ui/card';
import IconButton from '@/components/ui/icon-button';

import ChatList from '../../chat-list';

import type { Chat } from 'pl-api';

const messages = defineMessages({
  title: { id: 'column.chats', defaultMessage: 'Chats' },
  settings: { id: 'chat_list_item.settings', defaultMessage: 'Chat settings' },
  newChat: { id: 'chat_pane.header.new_chat', defaultMessage: 'New chat' },
});

const ChatsPageSidebar = () => {
  const intl = useIntl();
  const navigate = useNavigate();

  const handleClickChat = useCallback(
    (chat: Chat | 'shoutbox') => {
      if (chat === 'shoutbox') {
        navigate({ to: '/chats/shoutbox' });
      } else {
        navigate({ to: '/chats/$chatId', params: { chatId: chat.id } });
      }
    },
    [navigate],
  );

  const handleChatCreate = () => {
    navigate({ to: '/chats/new' });
  };

  const handleSettingsClick = () => {
    navigate({ to: '/chats/settings' });
  };

  return (
    <div className='⁂-chats-page-sidebar-panel'>
      <div className='⁂-chats-page-sidebar-panel__header'>
        <CardTitle title={intl.formatMessage(messages.title)} />

        <div className='⁂-chats-page-sidebar-panel__actions'>
          <IconButton
            src={iconSlidersHorizontal}
            onClick={handleSettingsClick}
            title={intl.formatMessage(messages.settings)}
          />

          <IconButton
            src={iconPencilSimple}
            onClick={handleChatCreate}
            title={intl.formatMessage(messages.newChat)}
          />
        </div>
      </div>

      <div className='⁂-chats-page-sidebar-panel__list'>
        <ChatList onClickChat={handleClickChat} />
      </div>
    </div>
  );
};

export { ChatsPageSidebar as default };
