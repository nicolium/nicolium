import React, { useCallback } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { ChatWidgetScreens, useChatContext } from '@/contexts/chat-context';
import { useStatContext } from '@/contexts/stat-context';
import { useChats } from '@/queries/chats';
import { useShoutboxIsLoading } from '@/stores/shoutbox';

import ChatList from '../chat-list';
import ChatSearch from '../chat-search/chat-search';
import ChatPaneHeader from '../chat-widget/chat-pane-header';
import ChatWindow from '../chat-widget/chat-window';
import ChatSearchHeader from '../chat-widget/headers/chat-search-header';
import ShoutboxWindow from '../chat-widget/shoutbox-window';
import { Pane } from '../ui/pane';

import Blankslate from './blankslate';

import type { Chat } from 'pl-api';

const messages = defineMessages({
  newChat: { id: 'chat_pane.header.new_chat', defaultMessage: 'New chat' },
});

const ChatPane = () => {
  const intl = useIntl();
  const { unreadChatsCount } = useStatContext();
  const showShoutbox = !useShoutboxIsLoading();

  const { screen, changeScreen, isOpen, toggleChatPane } = useChatContext();
  const {
    chatsQuery: { data: chats, isLoading },
  } = useChats();

  const handleClickChat = useCallback(
    (nextChat: Chat | 'shoutbox') => {
      if (nextChat === 'shoutbox') {
        changeScreen(ChatWidgetScreens.SHOUTBOX);
      } else {
        changeScreen(ChatWidgetScreens.CHAT, nextChat.id);
      }
    },
    [changeScreen],
  );

  const renderBody = () => {
    if (Number(chats?.length) > 0 || showShoutbox || isLoading) {
      return (
        <div className='⁂-chat-widget__list'>
          <ChatList onClickChat={handleClickChat} />
        </div>
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
        secondaryActionTitle={intl.formatMessage(messages.newChat)}
      />

      {isOpen ? renderBody() : null}
    </Pane>
  );
};

export { ChatPane as default };
