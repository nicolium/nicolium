import clsx from 'clsx';
import React, { useState } from 'react';
import { Virtuoso } from 'react-virtuoso';

import PullToRefresh from 'pl-fe/components/pull-to-refresh';
import Spinner from 'pl-fe/components/ui/spinner';
import Stack from 'pl-fe/components/ui/stack';
import PlaceholderChat from 'pl-fe/features/placeholder/components/placeholder-chat';
import { useChats } from 'pl-fe/queries/chats';
import { useShoutboxIsLoading } from 'pl-fe/stores/shoutbox';

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
    <PullToRefresh
      onRefresh={handleRefresh}
      className={clsx({
        '⁂-chat-widget__list--near-top': isNearTop,
        '⁂-chat-widget__list--near-bottom': isNearBottom,
      })}
    >
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
  );
};

export { ChatList as default };
