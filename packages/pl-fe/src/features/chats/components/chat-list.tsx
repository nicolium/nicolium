import clsx from 'clsx';
import React, { useCallback, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';

import PullToRefresh from '@/components/pull-to-refresh';
import Spinner from '@/components/ui/spinner';
import Stack from '@/components/ui/stack';
import PlaceholderChat from '@/features/placeholder/components/placeholder-chat';
import { useChats } from '@/queries/chats';
import { useShoutboxIsLoading } from '@/stores/shoutbox';

import ChatListItem from './chat-list-item';
import ChatListShoutbox from './chat-list-shoutbox';

import type { Chat } from 'pl-api';

interface IChatList {
  onClickChat: (chat: Chat | 'shoutbox') => void;
  useWindowScroll?: boolean;
}

const ChatList: React.FC<IChatList> = ({ onClickChat, useWindowScroll = false }) => {
  const showShoutbox = !useShoutboxIsLoading();

  const { chatsQuery: { data: chats, isFetching, hasNextPage, fetchNextPage, refetch } } = useChats();

  const allChats: Array<Chat | 'shoutbox'> | undefined = showShoutbox ? ['shoutbox', ...(chats ?? [])] : chats;

  const [isNearBottom, setNearBottom] = useState<boolean>(false);
  const [isNearTop, setNearTop] = useState<boolean>(true);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  };

  const handleRefresh = () => refetch();

  const renderChatListItem = useCallback((_index: number, chat: Chat | 'shoutbox') => {
    if (chat === 'shoutbox') {
      return <div key='shoutbox' className='px-2'><ChatListShoutbox onClick={onClickChat} /></div>;
    }

    return <div key={chat.id} className='px-2'><ChatListItem chat={chat} onClick={onClickChat} /></div>;
  }, [onClickChat]);

  const renderEmpty = () => {
    if (isFetching) {
      return (
        <Stack space={2}>
          <PlaceholderChat />
          <PlaceholderChat />
          <PlaceholderChat />
        </Stack>
      );
    }

    return null;
  };

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      className={clsx({
        '⁂-chat-widget__list--near-top': isNearTop,
        '⁂-chat-widget__list--near-bottom': isNearBottom,
      })}
    >
      <Virtuoso
        atTopStateChange={(atTop) =>{
          setNearTop(atTop);
        }}
        atBottomStateChange={(atBottom) =>{
          setNearBottom(atBottom);
        }}
        useWindowScroll={useWindowScroll}
        data={allChats}
        endReached={handleLoadMore}
        itemContent={renderChatListItem}
        components={{
          ScrollSeekPlaceholder: PlaceholderChat,
          Footer: () => hasNextPage ? <Spinner withText={false} /> : null,
          EmptyPlaceholder: renderEmpty,
        }}
      />
    </PullToRefresh>
  );
};

export { ChatList as default };
