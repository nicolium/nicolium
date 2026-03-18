import { debounce } from '@tanstack/react-pacer/debouncer';
import React, { useCallback, useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import PlaceholderStatus from '@/components/placeholders/placeholder-status';
import ScrollableList from '@/components/scrollable-list';
import { useConversations } from '@/queries/conversations/use-conversations';
import { selectChild } from '@/utils/scroll-utils';

import Conversation from './conversation';

import type { VirtuosoHandle } from 'react-virtuoso';

const ConversationsList: React.FC = () => {
  const ref = useRef<VirtuosoHandle | null>(null);

  const { conversations, isLoading, hasNextPage, isFetching, fetchNextPage } = useConversations();

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
        if (hasNextPage) fetchNextPage();
      },
      { wait: 300, leading: true },
    ),
    [hasNextPage, fetchNextPage],
  );

  return (
    <ScrollableList
      scrollKey='direct'
      ref={ref}
      hasMore={hasNextPage}
      onLoadMore={handleLoadOlder}
      id='direct-list'
      isLoading={isFetching}
      showLoading={isLoading}
      emptyMessageText={
        <FormattedMessage
          id='empty_column.direct'
          defaultMessage="You don't have any direct messages yet. When you send or receive one, it will show up here."
        />
      }
      listClassName='⁂-status-list'
      placeholderComponent={PlaceholderStatus}
      placeholderCount={20}
    >
      {conversations.map((item) => (
        <Conversation
          key={item.id}
          conversation={item}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
        />
      ))}
    </ScrollableList>
  );
};

export { ConversationsList as default };
