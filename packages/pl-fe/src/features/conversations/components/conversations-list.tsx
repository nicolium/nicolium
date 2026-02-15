import { debounce } from '@tanstack/react-pacer/debouncer';
import React, { useCallback, useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import { expandConversations } from '@/actions/conversations';
import ScrollableList from '@/components/scrollable-list';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useAppSelector } from '@/hooks/use-app-selector';
import { selectChild } from '@/utils/scroll-utils';

import Conversation from './conversation';

import type { VirtuosoHandle } from 'react-virtuoso';

const ConversationsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const ref = useRef<VirtuosoHandle>(null);

  const conversations = useAppSelector((state) => state.conversations.items);
  const isLoading = useAppSelector((state) => state.conversations.isLoading);
  const hasMore = useAppSelector((state) => state.conversations.hasMore);

  const getCurrentIndex = (id: string) => conversations.findIndex((x) => x.id === id);

  const handleMoveUp = (id: string) => {
    const elementIndex = getCurrentIndex(id) - 1;
    selectChild(elementIndex, ref, document.getElementById('direct-list') ?? undefined);
  };

  const handleMoveDown = (id: string) => {
    const elementIndex = getCurrentIndex(id) + 1;
    selectChild(
      elementIndex,
      ref,
      document.getElementById('direct-list') ?? undefined,
      conversations.length,
    );
  };

  const handleLoadOlder = useCallback(
    debounce(
      () => {
        if (hasMore) dispatch(expandConversations());
      },
      { wait: 300, leading: true },
    ),
    [hasMore],
  );

  return (
    <ScrollableList
      scrollKey='direct'
      ref={ref}
      hasMore={hasMore}
      onLoadMore={handleLoadOlder}
      id='direct-list'
      isLoading={isLoading}
      showLoading={isLoading && conversations.length === 0}
      emptyMessageText={
        <FormattedMessage
          id='empty_column.direct'
          defaultMessage="You don't have any direct messages yet. When you send or receive one, it will show up here."
        />
      }
      listClassName='⁂-status-list'
    >
      {conversations.map((item: any) => (
        <Conversation
          key={item.id}
          conversationId={item.id}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
        />
      ))}
    </ScrollableList>
  );
};

export { ConversationsList as default };
