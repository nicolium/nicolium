import debounce from 'lodash/debounce';
import React, { useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import { expandConversations } from 'pl-fe/actions/conversations';
import ScrollableList from 'pl-fe/components/scrollable-list';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { selectChild } from 'pl-fe/utils/scroll-utils';

import Conversation from './conversation';

import type { VirtuosoHandle } from 'react-virtuoso';

const ConversationsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const ref = useRef<VirtuosoHandle>(null);

  const conversations = useAppSelector((state) => state.conversations.items);
  const isLoading = useAppSelector((state) => state.conversations.isLoading);
  const hasMore = useAppSelector((state) => !!state.conversations.next);

  const getCurrentIndex = (id: string) => conversations.findIndex(x => x.id === id);

  const handleMoveUp = (id: string) => {
    const elementIndex = getCurrentIndex(id) - 1;
    selectChild(elementIndex, ref, document.getElementById('direct-list') || undefined);
  };

  const handleMoveDown = (id: string) => {
    const elementIndex = getCurrentIndex(id) + 1;
    selectChild(elementIndex, ref, document.getElementById('direct-list') || undefined, conversations.length);
  };

  const handleLoadOlder = debounce(() => {
    if (hasMore) dispatch(expandConversations());
  }, 300, { leading: true });

  return (
    <ScrollableList
      scrollKey='direct'
      ref={ref}
      hasMore={hasMore}
      onLoadMore={handleLoadOlder}
      id='direct-list'
      isLoading={isLoading}
      showLoading={isLoading && conversations.length === 0}
      emptyMessageText={<FormattedMessage id='empty_column.direct' defaultMessage="You don't have any direct messages yet. When you send or receive one, it will show up here." />}
      listClassName='divide-y divide-solid divide-gray-200 black:divide-gray-800 dark:divide-primary-800'
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
