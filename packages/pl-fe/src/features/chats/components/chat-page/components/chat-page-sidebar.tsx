import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { CardTitle } from 'pl-fe/components/ui/card';
import HStack from 'pl-fe/components/ui/hstack';
import IconButton from 'pl-fe/components/ui/icon-button';
import Stack from 'pl-fe/components/ui/stack';

import ChatList from '../../chat-list';

import type { Chat } from 'pl-api';

const messages = defineMessages({
  title: { id: 'column.chats', defaultMessage: 'Chats' },
});

const ChatPageSidebar = () => {
  const intl = useIntl();
  const history = useHistory();

  const handleClickChat = (chat: Chat | 'shoutbox') => {
    history.push(`/chats/${chat === 'shoutbox' ? 'shoutbox' : chat.id}`);
  };

  const handleChatCreate = () => {
    history.push('/chats/new');
  };

  const handleSettingsClick = () => {
    history.push('/chats/settings');
  };

  return (
    <Stack space={4} className='h-full'>
      <Stack space={4} className='px-4 pt-6'>
        <HStack alignItems='center' justifyContent='between'>
          <CardTitle title={intl.formatMessage(messages.title)} />

          <HStack space={1}>
            <IconButton
              src={require('@phosphor-icons/core/regular/sliders-horizontal.svg')}
              iconClassName='h-5 w-5 text-gray-600'
              onClick={handleSettingsClick}
            />

            <IconButton
              src={require('@phosphor-icons/core/regular/pencil-simple.svg')}
              iconClassName='h-5 w-5 text-gray-600'
              onClick={handleChatCreate}
            />
          </HStack>
        </HStack>
      </Stack>

      <Stack className='h-full grow overflow-auto'>
        <ChatList onClickChat={handleClickChat} />
      </Stack>
    </Stack>
  );
};

export { ChatPageSidebar as default };
