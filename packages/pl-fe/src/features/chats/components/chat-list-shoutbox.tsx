import React from 'react';
import { FormattedMessage } from 'react-intl';

import { useAccount } from '@/api/hooks/accounts/use-account';
import { ParsedContent } from '@/components/parsed-content';
import Avatar from '@/components/ui/avatar';
import Emojify from '@/features/emoji/emojify';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useInstance } from '@/hooks/use-instance';
import { useShoutboxMessages } from '@/stores/shoutbox';

import type { Chat } from 'pl-api';

interface IChatListShoutboxInterface {
  onClick: (chat: Chat | 'shoutbox') => void;
}

const ChatListShoutbox: React.FC<IChatListShoutboxInterface> = ({ onClick }) => {
  const instance = useInstance();
  const { logo } = useFrontendConfig();
  const messages = useShoutboxMessages();

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onClick('shoutbox');
    }
  };

  const lastMessage = messages.at(-1);
  const { account: lastMessageAuthor } = useAccount(lastMessage?.author_id);

  return (
    <div
      role='button'
      key='shoutbox'
      onClick={() => {
        onClick('shoutbox');
      }}
      onKeyDown={handleKeyDown}
      className='⁂-chat-list-item ⁂-chat-list-item--shoutbox'
      data-testid='chat-list-item'
      tabIndex={0}
    >
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
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { ChatListShoutbox as default };
