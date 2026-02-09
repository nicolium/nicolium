import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Icon from '@/components/ui/icon';
import Text from '@/components/ui/text';
import { ChatWidgetScreens, useChatContext } from '@/contexts/chat-context';

import ChatPaneHeader from '../chat-pane-header';

const messages = defineMessages({
  back: { id: 'card.back.label', defaultMessage: 'Back' },
});

const ChatSearchHeader = () => {
  const intl = useIntl();

  const { changeScreen, isOpen, toggleChatPane } = useChatContext();

  return (
    <ChatPaneHeader
      data-testid='pane-header'
      title={
        <div className='⁂-chat-widget__search-header'>
          <button
            onClick={() => {
              changeScreen(ChatWidgetScreens.INBOX);
            }}
            title={intl.formatMessage(messages.back)}
          >
            <Icon
              src={require('@phosphor-icons/core/regular/arrow-left.svg')}
              className='size-6 text-gray-600 dark:text-gray-400 rtl:rotate-180'
            />
          </button>

          <Text size='sm' weight='bold' truncate>
            <FormattedMessage id='chat_search.title' defaultMessage='Messages' />
          </Text>
        </div>
      }
      isOpen={isOpen}
      isToggleable={false}
      onToggle={toggleChatPane}
    />
  );
};

export { ChatSearchHeader as default };
