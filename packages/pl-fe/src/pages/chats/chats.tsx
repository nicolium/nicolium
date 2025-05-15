import React from 'react';

import { ChatProvider } from 'pl-fe/contexts/chat-context';
import ChatPage from 'pl-fe/features/chats/components/chat-page/chat-page';

interface IChatIndex {
  params?: {
    chatId?: string;
  };
}

const ChatIndex: React.FC<IChatIndex> = ({ params }) => (
  <ChatProvider>
    <ChatPage chatId={params?.chatId} />
  </ChatProvider>
);

export { ChatIndex as default };
