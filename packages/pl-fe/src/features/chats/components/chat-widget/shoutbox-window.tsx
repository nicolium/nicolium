import React from 'react';
import { FormattedMessage } from 'react-intl';

import Avatar from '@/components/ui/avatar';
import HStack from '@/components/ui/hstack';
import Icon from '@/components/ui/icon';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import { ChatWidgetScreens, useChatContext } from '@/contexts/chat-context';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useInstance } from '@/hooks/use-instance';

import Shoutbox from '../shoutbox';

import ChatPaneHeader from './chat-pane-header';

const ShoutboxWindow = () => {
  const { changeScreen, isOpen, toggleChatPane } = useChatContext();
  const instance = useInstance();
  const { logo } = useFrontendConfig();

  const closeChat = () => {
    changeScreen(ChatWidgetScreens.INBOX);
  };

  return (
    <>
      <ChatPaneHeader
        title={
          <HStack alignItems='center' space={2}>
            {isOpen && (
              <button onClick={closeChat}>
                <Icon
                  src={require('@phosphor-icons/core/regular/arrow-left.svg')}
                  className='size-6 text-gray-600 dark:text-gray-400 rtl:rotate-180'
                />
              </button>
            )}

            <HStack alignItems='center' space={3}>
              {isOpen && (
                <Avatar src={logo} alt='' size={40} className='flex-none' />
              )}

              <Stack alignItems='start'>
                <div className='flex grow items-center space-x-1'>
                  <Text size='sm' weight='bold' truncate>
                    <FormattedMessage id='chat_list_item_shoutbox' defaultMessage='{instance} shoutbox' values={{ instance: instance.title }} />
                  </Text>
                </div>
              </Stack>
            </HStack>
          </HStack>
        }
        isToggleable={!isOpen}
        isOpen={isOpen}
        onToggle={toggleChatPane}
      />

      <Stack className='h-full grow overflow-hidden' space={2}>
        <Shoutbox />
      </Stack>
    </>
  );
};

export { ShoutboxWindow as default };
