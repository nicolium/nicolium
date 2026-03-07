import React from 'react';
import { FormattedMessage } from 'react-intl';

import { ParsedContent } from '@/components/statuses/parsed-content';
import Avatar from '@/components/ui/avatar';
import Emojify from '@/features/emoji/emojify';
import { Hotkeys } from '@/features/ui/components/hotkeys';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useInstance } from '@/hooks/use-instance';
import { useAccount } from '@/queries/accounts/use-account';
import { useShoutboxMessages } from '@/stores/shoutbox';

import type { Chat } from 'pl-api';

interface IChatListShoutbox {
  onClick: (chat: Chat | 'shoutbox') => void;
  onMoveUp?: (chatId: string) => void;
  onMoveDown?: (chatId: string) => void;
}

const ChatListShoutbox: React.FC<IChatListShoutbox> = ({ onClick, onMoveUp, onMoveDown }) => {
  const instance = useInstance();
  const { logo } = useFrontendConfig();
  const messages = useShoutboxMessages();

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onClick('shoutbox');
    }
  };

  const handleMoveUp = () => {
    if (onMoveUp) {
      onMoveUp('shoutbox');
    }
  };

  const handleMoveDown = () => {
    if (onMoveDown) {
      onMoveDown('shoutbox');
    }
  };

  const handlers = {
    moveUp: handleMoveUp,
    moveDown: handleMoveDown,
  };

  const lastMessage = messages.at(-1);
  const { data: lastMessageAuthor } = useAccount(lastMessage?.author_id);

  return (
    <Hotkeys
      handlers={handlers}
      className='px-2'
      tabIndex={0}
      role='button'
      onClick={() => {
        onClick('shoutbox');
      }}
      onKeyDown={handleKeyDown}
    >
      <div className='⁂-chat-list-item ⁂-chat-list-item--shoutbox' data-testid='chat-list-item'>
        <div>
          <Avatar src={logo} alt='' size={40} className='flex-none' />
          <div className='⁂-chat-list-item__content'>
            <div className='⁂-chat-list-item__name'>
              <p>
                <FormattedMessage
                  id='chat_list_item_shoutbox'
                  defaultMessage='{instance} shoutbox'
                  values={{ instance: instance.title }}
                />
              </p>
            </div>

            {lastMessage && (
              <p className='⁂-chat-list-item__message'>
                {lastMessageAuthor && (
                  <span className='⁂-chat-list-item__message__author'>
                    <Emojify
                      text={lastMessageAuthor.display_name}
                      emojis={lastMessageAuthor.emojis}
                    />
                    {': '}
                  </span>
                )}
                <ParsedContent html={lastMessage.text} />
              </p>
            )}
          </div>
        </div>
      </div>
    </Hotkeys>
  );
};

export { ChatListShoutbox as default };
