import React from 'react';

import { useChats } from 'pl-fe/queries/chats';

import BlankslateEmpty from './blankslate-empty';
import BlankslateWithChats from './blankslate-with-chats';

const ChatPageMain = () => {
  const { chatsQuery: { data: chats, isLoading } } = useChats();

  if (isLoading) {
    return null;
  }

  if (chats && chats.length > 0) {
    return <BlankslateWithChats />;
  }

  return <BlankslateEmpty />;
};

export { ChatPageMain as default };
