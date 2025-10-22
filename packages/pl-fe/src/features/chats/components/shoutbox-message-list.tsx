import clsx from 'clsx';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import HoverAccountWrapper from 'pl-fe/components/hover-account-wrapper';
import { ParsedContent } from 'pl-fe/components/parsed-content';
import Avatar from 'pl-fe/components/ui/avatar';
import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import Emojify from 'pl-fe/features/emoji/emojify';
import PlaceholderChatMessage from 'pl-fe/features/placeholder/components/placeholder-chat-message';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useShoutboxIsLoading, useShoutboxMessages, type ShoutMessage } from 'pl-fe/stores/shoutbox';

import { ChatMessageListList, ChatMessageListScroller } from './chat-message-list';

const START_INDEX = 10000;

interface IShoutboxMessage {
  message: ShoutMessage;
  isMyMessage: boolean;
}

const ShoutboxMessage: React.FC<IShoutboxMessage> = ({ message, isMyMessage }) => {
  const { account } = useAccount(message.author_id);

  if (!account) return null;

  return (
    <div key={message.id} className='group relative px-4 py-2 hover:bg-gray-200/40 dark:hover:bg-gray-800/40'>
      <HStack
        space={2}
        alignItems='bottom'
        justifyContent={isMyMessage ? 'end' : 'start'}
        className={clsx({
          'ml-auto': isMyMessage,
        })}
      >
        {!isMyMessage && (
          <Link className='mb-0.5' to={`/@${account.acct}`} title={account.acct}>
            <HoverAccountWrapper accountId={account.id} element='span'>
              <Avatar
                src={account.avatar}
                alt={account.avatar_description}
                size={32}
                isCat={account.is_cat}
                username={account.username}
              />
            </HoverAccountWrapper>
          </Link>
        )}

        <Stack
          space={0.5}
          className={clsx({
            'max-w-[85%]': true,
            'order-3': isMyMessage,
            'order-1': !isMyMessage,
          })}
          alignItems={isMyMessage ? 'end' : 'start'}
        >
          <HStack alignItems='bottom' className='max-w-full'>
            <div
              className={
                clsx({
                  'text-ellipsis break-words relative rounded-md py-2 px-3 max-w-full space-y-2 [&_.mention]:underline': true,
                  '[&_.mention]:text-primary-600 dark:[&_.mention]:text-accent-blue': !isMyMessage,
                  '[&_.mention]:text-white dark:[&_.mention]:white': isMyMessage,
                  'bg-primary-500 text-white': isMyMessage,
                  'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100': !isMyMessage,
                  // '!bg-transparent !p-0 emoji-lg': isOnlyEmoji,
                })
              }
              tabIndex={0}
            >
              <Text size='sm' theme='inherit' className='break-word-nested'>
                <ParsedContent html={message.text} />
              </Text>
            </div>
          </HStack>
          {!isMyMessage && (
            <Text size='xs' theme='muted'>
              <Emojify text={account.display_name} emojis={account.emojis} />
            </Text>
          )}
        </Stack>
      </HStack>
    </div>
  );
};

/** Scrollable list of shoutbox messages. */
const ShoutboxMessageList: React.FC = () => {
  const node = useRef<VirtuosoHandle>(null);
  const [firstItemIndex, setFirstItemIndex] = useState(START_INDEX - 20);

  const me = useAppSelector(state => state.me);
  const shoutboxMessages = useShoutboxMessages() || [];
  const isLoading = useShoutboxIsLoading();

  const lastShoutboxMessage = shoutboxMessages?.at(-1) || null;

  useEffect(() => {
    if (!shoutboxMessages) {
      return;
    }

    const nextFirstItemIndex = START_INDEX - shoutboxMessages.length;
    setFirstItemIndex(nextFirstItemIndex);
  }, [lastShoutboxMessage]);

  const initialScrollPositionProps = useMemo(() => {
    if (process.env.NODE_ENV === 'test') {
      return {};
    }

    return {
      initialTopMostItemIndex: shoutboxMessages.length - 1,
      firstItemIndex: Math.max(0, firstItemIndex),
    };
  }, [shoutboxMessages.length, firstItemIndex]);

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
          data={shoutboxMessages}
          followOutput='auto'
          itemContent={(index, shoutboxMessage) => (
            <ShoutboxMessage
              key={shoutboxMessage.id}
              message={shoutboxMessage}
              isMyMessage={shoutboxMessage.author_id === me}
            />
          )}
          components={{
            List: ChatMessageListList,
            Scroller: ChatMessageListScroller,
          }}
        />
      </div>
    </div>
  );
};

export { ShoutboxMessageList as default };
