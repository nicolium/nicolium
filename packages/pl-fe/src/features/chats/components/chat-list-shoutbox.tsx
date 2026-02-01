import React from 'react';
import { FormattedMessage } from 'react-intl';

import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import { ParsedContent } from 'pl-fe/components/parsed-content';
import Avatar from 'pl-fe/components/ui/avatar';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { usePlFeConfig } from 'pl-fe/hooks/use-pl-fe-config';
import { useShoutboxMessages } from 'pl-fe/stores/shoutbox';

import type { Chat } from 'pl-api';

interface IChatListShoutboxInterface {
  onClick: (chat: Chat | 'shoutbox') => void;
}

const ChatListShoutbox: React.FC<IChatListShoutboxInterface> = ({ onClick }) => {
  const instance = useInstance();
  const { logo } = usePlFeConfig();
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
      onClick={() => onClick('shoutbox')}
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
              <FormattedMessage id='chat_list_item_shoutbox' defaultMessage='{instance} shoutbox' values={{ instance: instance.title }} />
            </p>
          </div>

          {lastMessage && (
            <>
              <p className='⁂-chat-list-item__message'>
                {lastMessageAuthor && (
                  <span className='⁂-chat-list-item__message__author'>
                    {lastMessageAuthor.display_name || `@${lastMessageAuthor.username}`}:
                    {' '}
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
