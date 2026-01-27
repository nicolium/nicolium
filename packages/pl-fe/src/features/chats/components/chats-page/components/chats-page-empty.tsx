import React from 'react';

import { useChats } from 'pl-fe/queries/chats';

import BlankslateEmpty from './blankslate-empty';
import BlankslateWithChats from './blankslate-with-chats';

const ChatsPageEmpty = () => {
  const { chatsQuery: { data: chats, isLoading } } = useChats();

  if (isLoading) {
    return null;
  }

  if (chats && chats.length > 0) {
    return <BlankslateWithChats />;
  }

  return <BlankslateEmpty />;
};

export { ChatsPageEmpty as default };
