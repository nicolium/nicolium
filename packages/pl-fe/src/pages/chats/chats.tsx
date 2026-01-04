import React from 'react';

import { ChatProvider } from 'pl-fe/contexts/chat-context';
import ChatPage from 'pl-fe/features/chats/components/chat-page/chat-page';

const ChatIndex: React.FC = () => (
  <ChatProvider>
    <ChatPage />
  </ChatProvider>
);

export { ChatIndex as default };
