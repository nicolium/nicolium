import { useMatch } from '@tanstack/react-router';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { toggleChatPane } from 'pl-fe/actions/chats';
import { chatRoute, layouts } from 'pl-fe/features/ui/router';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useChat } from 'pl-fe/queries/chats';
import { useSettings } from 'pl-fe/stores/settings';

import type { Chat } from 'pl-api';

const ChatContext = createContext<any>({
  isOpen: false,
});

enum ChatWidgetScreens {
  INBOX = 'INBOX',
  SEARCH = 'SEARCH',
  CHAT = 'CHAT',
  CHAT_SETTINGS = 'CHAT_SETTINGS',
  SHOUTBOX = 'SHOUTBOX',
}

interface IChatProvider {
  children: React.ReactNode;
}

const ChatProvider: React.FC<IChatProvider> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { chats } = useSettings();

  const isUsingMainChatPage = !!useMatch({ from: layouts.chats.id, shouldThrow: false });
  const chatPageMatch = useMatch({ from: chatRoute.id, shouldThrow: false });
  const { chatId = null } = chatPageMatch?.params ?? {};

  const [screen, setScreen] = useState<ChatWidgetScreens>(ChatWidgetScreens.INBOX);
  const [currentChatId, setCurrentChatId] = useState<null | string>(chatId);

  const { data: chat } = useChat(currentChatId as string);

  const isOpen = chats.mainWindow === 'open';

  const changeScreen = (screen: ChatWidgetScreens, currentChatId?: string | null) => {
    setCurrentChatId(currentChatId || null);
    setScreen(screen);
  };

  const handleChatPaneToggle = () => dispatch(toggleChatPane());

  const value = useMemo(() => ({
    chat,
    isOpen,
    isUsingMainChatPage,
    toggleChatPane: handleChatPaneToggle,
    screen,
    changeScreen,
    currentChatId,
  }), [chat, currentChatId, isUsingMainChatPage, isOpen, screen, changeScreen]);

  useEffect(() => {
    if (chatId) {
      setCurrentChatId(chatId);
    } else {
      setCurrentChatId(null);
    }
  }, [chatId]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

interface IChatContext {
  chat: Chat | null;
  isOpen: boolean;
  isUsingMainChatPage?: boolean;
  toggleChatPane(): void;
  screen: ChatWidgetScreens;
  currentChatId: string | null;
  changeScreen(screen: ChatWidgetScreens, currentChatId?: string | null): void;
}

const useChatContext = (): IChatContext => useContext(ChatContext);

export { ChatContext, ChatProvider, useChatContext, ChatWidgetScreens };
