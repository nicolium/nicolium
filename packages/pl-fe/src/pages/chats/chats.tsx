import React from 'react';

import { ChatProvider } from 'pl-fe/contexts/chat-context';
import ChatPage from 'pl-fe/features/chats/components/chats-page/chats-page';

const ChatIndex: React.FC = () => (
  <ChatProvider>
    <ChatPage />
  </ChatProvider>
);

export { ChatIndex as default };
