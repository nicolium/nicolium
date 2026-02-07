import clsx from 'clsx';
import React, { useState } from 'react';
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

  const allChats: Array<Chat | 'shoutbox'> | undefined = showShoutbox ? ['shoutbox', ...(chats || [])] : chats;

  const [isNearBottom, setNearBottom] = useState<boolean>(false);
  const [isNearTop, setNearTop] = useState<boolean>(true);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  };

  const handleRefresh = () => refetch();

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
    <div className='relative h-full'>
      <PullToRefresh onRefresh={handleRefresh}>
        <Virtuoso
          atTopStateChange={(atTop) => setNearTop(atTop)}
          atBottomStateChange={(atBottom) => setNearBottom(atBottom)}
          useWindowScroll={useWindowScroll}
          data={allChats}
          endReached={handleLoadMore}
          itemContent={(_index, chat) => (
            <div className='px-2'>
              {chat === 'shoutbox' ? <ChatListShoutbox onClick={onClickChat} /> : <ChatListItem chat={chat} onClick={onClickChat} />}
            </div>
          )}
          components={{
            ScrollSeekPlaceholder: () => <PlaceholderChat />,
            Footer: () => hasNextPage ? <Spinner withText={false} /> : null,
            EmptyPlaceholder: renderEmpty,
          }}
        />
      </PullToRefresh>

      <>
        <div
          className={clsx('pointer-events-none absolute inset-x-0 flex justify-center rounded-t-lg bg-gradient-to-b from-white to-transparent pb-12 pt-8 transition-opacity duration-500 black:from-black dark:from-gray-900', {
            'opacity-0': isNearTop,
            'opacity-100 black:opacity-50': !isNearTop,
          })}
        />
        <div
          className={clsx('pointer-events-none absolute inset-x-0 bottom-0 flex justify-center rounded-b-lg bg-gradient-to-t from-white to-transparent pb-8 pt-12 transition-opacity duration-500 black:from-black dark:from-gray-900', {
            'opacity-0': isNearBottom,
            'opacity-100 black:opacity-50': !isNearBottom,
          })}
        />
      </>
    </div>
  );
};

export { ChatList as default };
