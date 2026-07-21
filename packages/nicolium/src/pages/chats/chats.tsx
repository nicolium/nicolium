import React from 'react';

import ChatsPage from '@/components/chats/chats-page/chats-page';
import { ChatProvider } from '@/contexts/chat-context';

const ChatIndex: React.FC = () => (
  <ChatProvider>
    <ChatsPage />
  </ChatProvider>
);

export { ChatIndex as default };
