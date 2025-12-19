import { useMatch } from '@tanstack/react-router';
import React from 'react';

import { ChatProvider } from 'pl-fe/contexts/chat-context';
import { layouts } from 'pl-fe/features/ui/router';

import ChatPane from '../chat-pane/chat-pane';

const ChatWidget = () => {
  const match = useMatch({ from: layouts.chats.id, shouldThrow: false });

  if (match) {
    return null;
  }

  return (
    <ChatProvider>
      <ChatPane />
    </ChatProvider>
  );
};

export { ChatWidget as default };
