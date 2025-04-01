import React from 'react';
import { FormattedMessage } from 'react-intl';

import { ParsedContent } from 'pl-fe/components/parsed-content';
import Avatar from 'pl-fe/components/ui/avatar';
import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { usePlFeConfig } from 'pl-fe/hooks/use-pl-fe-config';

import type { Chat } from 'pl-api';

interface IChatListShoutboxInterface {
  onClick: (chat: Chat | 'shoutbox') => void;
}

const ChatListShoutbox: React.FC<IChatListShoutboxInterface> = ({ onClick }) => {
  const instance = useInstance();
  const { logo } = usePlFeConfig();
  const messages = useAppSelector((state) => state.shoutbox.messages);

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onClick('shoutbox');
    }
  };

  const lastMessage = messages.at(-1);

  return (
    <div
      role='button'
      key='shoutbox'
      onClick={() => onClick('shoutbox')}
      onKeyDown={handleKeyDown}
      className='group flex w-full flex-col rounded-lg px-2 py-3 hover:bg-gray-100 focus:shadow-inset-ring dark:hover:bg-gray-800'
      data-testid='chat-list-item'
      tabIndex={0}
    >
      <HStack alignItems='center' justifyContent='between' space={2} className='w-full'>
        <HStack alignItems='center' space={2} className='overflow-hidden'>
          <Avatar src={logo} alt='' size={40} className='flex-none' />
          <Stack alignItems='start' className='overflow-hidden'>
            <div className='flex w-full grow items-center space-x-1'>
              <Text weight='bold' size='sm' align='left' truncate>
                <FormattedMessage id='chat_list_item_shoutbox' defaultMessage='{instance} shoutbox' values={{ instance: instance.title }} />
              </Text>
            </div>

            {lastMessage && (
              <>
                <Text
                  align='left'
                  size='sm'
                  weight='medium'
                  theme='default'
                  truncate
                  className='truncate-child pointer-events-none h-5 w-full'
                >
                  <Text weight='bold' size='sm' align='left' truncate tag='span'>{lastMessage.author.display_name || `@${lastMessage.author.username}`}: </Text>
                  <ParsedContent html={lastMessage.text} />
                </Text>
              </>
            )}
          </Stack>
        </HStack>
      </HStack>
    </div>
  );
};

export { ChatListShoutbox as default };
