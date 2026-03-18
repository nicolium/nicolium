import iconArrowLeft from '@phosphor-icons/core/regular/arrow-left.svg';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Avatar from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import Text from '@/components/ui/text';
import { ChatWidgetScreens, useChatContext } from '@/contexts/chat-context';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useInstance } from '@/stores/instance';

import Shoutbox from '../shoutbox';

import ChatPaneHeader from './chat-pane-header';

const messages = defineMessages({
  back: { id: 'card.back.label', defaultMessage: 'Back' },
});

const ShoutboxWindow = () => {
  const { changeScreen, isOpen, toggleChatPane } = useChatContext();
  const instance = useInstance();
  const intl = useIntl();
  const { logo } = useFrontendConfig();

  const closeChat = () => {
    changeScreen(ChatWidgetScreens.INBOX);
  };

  return (
    <>
      <ChatPaneHeader
        title={
          <div className='flex items-center gap-2'>
            {isOpen && (
              <button onClick={closeChat} title={intl.formatMessage(messages.back)}>
                <Icon
                  src={iconArrowLeft}
                  className='size-6 text-gray-600 dark:text-gray-400 rtl:rotate-180'
                />
              </button>
            )}

            <div className='flex items-center gap-3'>
              {isOpen && <Avatar src={logo} alt='' size={40} className='flex-none' />}

              <div className='flex flex-col items-start'>
                <div className='flex grow items-center space-x-1'>
                  <Text size='sm' weight='bold' truncate>
                    <FormattedMessage
                      id='chat_list_item_shoutbox'
                      defaultMessage='{instance} shoutbox'
                      values={{ instance: instance.title }}
                    />
                  </Text>
                </div>
              </div>
            </div>
          </div>
        }
        isToggleable={!isOpen}
        isOpen={isOpen}
        onToggle={toggleChatPane}
      />

      <div className='flex h-full grow flex-col gap-2 overflow-hidden'>
        <Shoutbox />
      </div>
    </>
  );
};

export { ShoutboxWindow as default };
