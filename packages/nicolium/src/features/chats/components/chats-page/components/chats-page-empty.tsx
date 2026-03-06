import React from 'react';

import { useChats } from '@/queries/chats';
import { useShoutboxIsLoading } from '@/stores/shoutbox';

import BlankslateEmpty from './blankslate-empty';
import BlankslateWithChats from './blankslate-with-chats';

const ChatsPageEmpty = () => {
  const showShoutbox = !useShoutboxIsLoading();
  const {
    chatsQuery: { data: chats, isLoading },
  } = useChats();

  if (isLoading) {
    return null;
  }

  if ((chats && chats.length > 0) || showShoutbox) {
    return <BlankslateWithChats />;
  }

  return <BlankslateEmpty />;
};

export { ChatsPageEmpty as default };
