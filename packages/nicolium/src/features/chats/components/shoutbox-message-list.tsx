import clsx from 'clsx';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso';

import { AccountLink } from '@/components/accounts/account-link';
import HoverAccountWrapper from '@/components/accounts/hover-account-wrapper';
import PlaceholderChatMessage from '@/components/placeholders/placeholder-chat-message';
import { ParsedContent } from '@/components/statuses/parsed-content';
import Avatar from '@/components/ui/avatar';
import { useCurrentAccount } from '@/contexts/current-account-context';
import Emojify from '@/features/emoji/emojify';
import { useAccount } from '@/queries/accounts/use-account';
import { useShoutboxIsLoading, useShoutboxMessages, type ShoutMessage } from '@/stores/shoutbox';

import { ChatMessageListList, ChatMessageListScroller } from './chat-message-list';

const START_INDEX = 10000;

interface IShoutboxMessage {
  message: ShoutMessage;
  isMyMessage: boolean;
}

const ShoutboxMessage: React.FC<IShoutboxMessage> = ({ message, isMyMessage }) => {
  const { data: account } = useAccount(message.author_id);

  if (!account) return null;

  return (
    <div key={message.id} className='⁂-shoutbox-message__container'>
      <div
        className={clsx('⁂-shoutbox-message', {
          '⁂-shoutbox-message--my-message': isMyMessage,
        })}
      >
        {!isMyMessage && (
          <AccountLink account={account} title={account.acct}>
            <HoverAccountWrapper accountId={account.id} element='span'>
              <Avatar
                src={account.avatar}
                alt={account.avatar_description}
                size={32}
                isCat={account.is_cat}
                username={account.username}
              />
            </HoverAccountWrapper>
          </AccountLink>
        )}

        <div
          className={clsx('⁂-shoutbox-message__content', {
            '⁂-shoutbox-message__content--my-message': isMyMessage,
          })}
        >
          <div
            className={clsx({
              '⁂-shoutbox-message__bubble': true,
              '⁂-shoutbox-message__bubble--my-message': isMyMessage,
            })}
            tabIndex={0}
          >
            <div className='⁂-shoutbox-message__text'>
              <ParsedContent html={message.text} />
            </div>
          </div>
          {!isMyMessage && (
            <span className='⁂-shoutbox-message__author'>
              <Emojify text={account.display_name} emojis={account.emojis} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/** Scrollable list of shoutbox messages. */
const ShoutboxMessageList: React.FC = () => {
  const node = useRef<VirtuosoHandle | null>(null);
  const [firstItemIndex, setFirstItemIndex] = useState(START_INDEX - 20);

  const me = useCurrentAccount();
  const shoutboxMessages = useShoutboxMessages() || [];
  const isLoading = useShoutboxIsLoading();

  const lastShoutboxMessage = shoutboxMessages?.at(-1) ?? null;

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
      <div className='⁂-chat-message-list ⁂-chat-message-list--placeholder'>
        <div>
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
    <div className='⁂-chat-message-list__container'>
      <div className='⁂-chat-message-list'>
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
