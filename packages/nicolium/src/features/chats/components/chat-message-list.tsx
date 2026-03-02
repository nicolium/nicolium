import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { type Components, Virtuoso, type VirtuosoHandle } from 'react-virtuoso';

import Avatar from '@/components/ui/avatar';
import Button from '@/components/ui/button';
import Divider from '@/components/ui/divider';
import Spinner from '@/components/ui/spinner';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import PlaceholderChatMessage from '@/features/placeholder/components/placeholder-chat-message';
import { useRelationshipQuery } from '@/queries/accounts/use-relationship';
import {
  useChatMessages,
  useMarkChatAsRead,
  type ChatMessage as ChatMessageEntity,
} from '@/queries/chats';

import ChatMessage from './chat-message';

import type { Chat } from 'pl-api';

const messages = defineMessages({
  today: { id: 'chats.dividers.today', defaultMessage: 'Today' },
  blockedBy: { id: 'chat_message_list.blocked_by', defaultMessage: 'You are blocked by' },
  networkFailureTitle: { id: 'chat_message_list.network_failure.title', defaultMessage: 'Whoops!' },
  networkFailureSubtitle: {
    id: 'chat_message_list.network_failure.subtitle',
    defaultMessage: 'We encountered a network failure.',
  },
  networkFailureAction: {
    id: 'chat_message_list.network_failure.action',
    defaultMessage: 'Try again',
  },
});

type TimeFormat = 'today' | 'date';

const timeChange = (
  prev: Pick<ChatMessageEntity, 'created_at'>,
  curr: Pick<ChatMessageEntity, 'created_at'>,
): TimeFormat | null => {
  const prevDate = new Date(prev.created_at).getDate();
  const currDate = new Date(curr.created_at).getDate();
  const nowDate = new Date().getDate();

  if (prevDate !== currDate) {
    return currDate === nowDate ? 'today' : 'date';
  }

  return null;
};

const START_INDEX = 10000;

const List: Components['List'] = React.forwardRef((props, ref) => {
  const { context, ...rest } = props;
  return <div ref={ref} {...rest} className='mb-2' />;
});

List.displayName = 'ChatMessageListList';

const Scroller: Components['Scroller'] = React.forwardRef((props, ref) => {
  const { style, context, ...rest } = props;

  return (
    <div
      {...rest}
      ref={ref}
      style={{
        ...style,
        scrollbarGutter: 'stable',
      }}
    />
  );
});

Scroller.displayName = 'ChatMessageListScroller';

interface IChatMessageList {
  /** Chat the messages are being rendered from. */
  chat: Chat;
}

/** Scrollable list of chat messages. */
const ChatMessageList: React.FC<IChatMessageList> = React.memo(({ chat }) => {
  const intl = useIntl();

  const node = useRef<VirtuosoHandle | null>(null);
  const [firstItemIndex, setFirstItemIndex] = useState(START_INDEX - 20);

  const markChatAsRead = useMarkChatAsRead(chat.id);
  const {
    data: chatMessages,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetching,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useChatMessages(chat);

  const isBlocked = !!useRelationshipQuery(chat.account.id).data?.blocked_by;

  const formattedChatMessages = chatMessages ?? [];

  const lastChatMessage = chatMessages ? chatMessages[chatMessages.length - 1] : null;

  useEffect(() => {
    if (!chatMessages) {
      return;
    }

    const nextFirstItemIndex = START_INDEX - chatMessages.length;
    setFirstItemIndex(nextFirstItemIndex);
  }, [lastChatMessage]);

  const buildCachedMessages = (): Array<ChatMessageEntity | { type: 'divider'; text: string }> => {
    if (!chatMessages) {
      return [];
    }

    const currentYear = new Date().getFullYear();

    return chatMessages.reduce((acc: any, curr: any, idx: number) => {
      const lastMessage = formattedChatMessages[idx - 1];

      const messageDate = new Date(curr.created_at);

      if (lastMessage) {
        switch (timeChange(lastMessage, curr)) {
          case 'today':
            acc.push({
              type: 'divider',
              text: intl.formatMessage(messages.today),
            });
            break;
          case 'date':
            acc.push({
              type: 'divider',
              text: intl.formatDate(messageDate, {
                weekday: 'short',
                hour: 'numeric',
                minute: '2-digit',
                month: 'short',
                day: 'numeric',
                year: messageDate.getFullYear() !== currentYear ? '2-digit' : undefined,
              }),
            });
            break;
        }
      }

      acc.push(curr);
      return acc;
    }, []);
  };
  const cachedChatMessages = useMemo(() => buildCachedMessages(), [chatMessages]);

  const initialScrollPositionProps = useMemo(() => {
    if (process.env.NODE_ENV === 'test') {
      return {};
    }

    return {
      initialTopMostItemIndex: cachedChatMessages.length - 1,
      firstItemIndex: Math.max(0, firstItemIndex),
    };
  }, [cachedChatMessages.length, firstItemIndex]);

  const handleStartReached = useCallback(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
    return false;
  }, [firstItemIndex, hasNextPage, isFetching]);

  const renderChatMessage = useCallback(
    (index: number, chatMessage: ChatMessageEntity | { type: 'divider'; text: string }) => {
      if ('type' in chatMessage && chatMessage.type === 'divider') {
        return <Divider key={index} text={chatMessage.text} textSize='xs' />;
      }

      return <ChatMessage key={chatMessage.id} chat={chat} chatMessage={chatMessage} />;
    },
    [chat],
  );

  useEffect(() => {
    const lastMessage = formattedChatMessages[formattedChatMessages.length - 1];
    if (!lastMessage) {
      return;
    }

    const lastMessageId = lastMessage.id;
    const isMessagePending = lastMessage.pending;

    /**
     * Only "mark the message as read" if..
     * 1) it is not pending and
     * 2) it has not already been read
     */
    if (!isMessagePending) {
      markChatAsRead.mutate(lastMessageId);
    }
  }, [formattedChatMessages.length]);

  if (isBlocked) {
    return (
      <Stack alignItems='center' justifyContent='center' className='h-full grow'>
        <Stack alignItems='center' space={2}>
          <Avatar
            src={chat.account.avatar}
            alt={chat.account.avatar_description}
            size={75}
            isCat={chat.account.is_cat}
            username={chat.account.username}
          />
          <Text align='center'>
            <>
              <Text tag='span'>{intl.formatMessage(messages.blockedBy)}</Text>{' '}
              <Text tag='span' theme='primary'>
                @{chat.account.acct}
              </Text>
            </>
          </Text>
        </Stack>
      </Stack>
    );
  }

  if (isError) {
    return (
      <Stack alignItems='center' justifyContent='center' className='h-full grow'>
        <Stack space={4}>
          <Stack space={1}>
            <Text size='lg' weight='bold' align='center'>
              {intl.formatMessage(messages.networkFailureTitle)}
            </Text>
            <Text theme='muted' align='center'>
              {intl.formatMessage(messages.networkFailureSubtitle)}
            </Text>
          </Stack>

          <div className='mx-auto'>
            <Button theme='primary' onClick={() => refetch()}>
              {intl.formatMessage(messages.networkFailureAction)}
            </Button>
          </div>
        </Stack>
      </Stack>
    );
  }

  if (isLoading) {
    return (
      <div className='flex grow flex-col justify-end pb-4'>
        <div className='px-4'>
          <PlaceholderChatMessage isMyMessage />
          <PlaceholderChatMessage />
          <PlaceholderChatMessage isMyMessage />
          <PlaceholderChatMessage isMyMessage />
          <PlaceholderChatMessage />
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-full grow flex-col space-y-6'>
      <div className='flex grow flex-col justify-end'>
        <Virtuoso
          ref={node}
          alignToBottom
          {...initialScrollPositionProps}
          data={cachedChatMessages}
          startReached={handleStartReached}
          followOutput='auto'
          itemContent={(index, chatMessage) => renderChatMessage(index, chatMessage)}
          components={{
            List,
            Scroller,
            Header: () => {
              if (hasNextPage || isFetchingNextPage) {
                return <Spinner withText={false} />;
              }

              return null;
            },
          }}
        />
      </div>
    </div>
  );
});

ChatMessageList.displayName = 'ChatMessageList';

export {
  ChatMessageList as default,
  List as ChatMessageListList,
  Scroller as ChatMessageListScroller,
};
