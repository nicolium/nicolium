import React from 'react';
import { FormattedMessage } from 'react-intl';

import Stack from 'pl-fe/components/ui/stack';
import { ChatWidgetScreens, useChatContext } from 'pl-fe/contexts/chat-context';
import { useStatContext } from 'pl-fe/contexts/stat-context';
import { useChats } from 'pl-fe/queries/chats';
import { useShoutboxStore } from 'pl-fe/stores/shoutbox';

import ChatList from '../chat-list';
import ChatSearch from '../chat-search/chat-search';
import ChatPaneHeader from '../chat-widget/chat-pane-header';
import ChatWindow from '../chat-widget/chat-window';
import ChatSearchHeader from '../chat-widget/headers/chat-search-header';
import ShoutboxWindow from '../chat-widget/shoutbox-window';
import { Pane } from '../ui/pane';

import Blankslate from './blankslate';

import type { Chat } from 'pl-api';

const ChatPane = () => {
  const { unreadChatsCount } = useStatContext();
  const showShoutbox = !useShoutboxStore().isLoading;

  const { screen, changeScreen, isOpen, toggleChatPane } = useChatContext();
  const { chatsQuery: { data: chats, isLoading } } = useChats();

  const handleClickChat = (nextChat: Chat | 'shoutbox') => {
    if (nextChat === 'shoutbox') {
      changeScreen(ChatWidgetScreens.SHOUTBOX);
    } else {
      changeScreen(ChatWidgetScreens.CHAT, nextChat.id);
    }
  };

  const renderBody = () => {
    if (Number(chats?.length) > 0 || showShoutbox || isLoading) {
      return (
        <Stack space={4} className='h-full grow'>
          <ChatList onClickChat={handleClickChat} />
        </Stack>
      );
    } else if (chats?.length === 0) {
      return (
        <Blankslate
          onSearch={() => {
            changeScreen(ChatWidgetScreens.SEARCH);
          }}
        />
      );
    }
  };

  // Active chat
  if (screen === ChatWidgetScreens.CHAT || screen === ChatWidgetScreens.CHAT_SETTINGS) {
    return (
      <Pane isOpen={isOpen}>
        <ChatWindow />
      </Pane>
    );
  }

  // Shoutbox
  if (screen === ChatWidgetScreens.SHOUTBOX) {
    return (
      <Pane isOpen={isOpen}>
        <ShoutboxWindow />
      </Pane>
    );
  }

  if (screen === ChatWidgetScreens.SEARCH) {
    return (
      <Pane isOpen={isOpen}>
        <ChatSearchHeader />

        {isOpen ? <ChatSearch /> : null}
      </Pane>
    );
  }

  return (
    <Pane isOpen={isOpen}>
      <ChatPaneHeader
        title={<FormattedMessage id='column.chats' defaultMessage='Chats' />}
        unreadCount={unreadChatsCount}
        isOpen={isOpen}
        onToggle={toggleChatPane}
        secondaryAction={() => {
          changeScreen(ChatWidgetScreens.SEARCH);

          if (!isOpen) {
            toggleChatPane();
          }
        }}
        secondaryActionIcon={require('@phosphor-icons/core/regular/note-pencil.svg')}
      />

      {isOpen ? renderBody() : null}
    </Pane>
  );
};

export { ChatPane as default };
