import React from 'react';

import { ChatProvider } from 'pl-fe/contexts/chat-context';
import ChatsPage from 'pl-fe/features/chats/components/chats-page/chats-page';

const ChatIndex: React.FC = () => (
  <ChatProvider>
    <ChatsPage />
  </ChatProvider>
);

export { ChatIndex as default };
