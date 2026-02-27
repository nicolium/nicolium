import React from 'react';

import { ChatProvider } from '@/contexts/chat-context';
import ChatsPage from '@/features/chats/components/chats-page/chats-page';

const ChatIndex: React.FC = () => (
  <ChatProvider>
    <ChatsPage />
  </ChatProvider>
);

export { ChatIndex as default };
