import iconArrowLeft from '@phosphor-icons/core/regular/arrow-left.svg';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Icon from '@/components/ui/icon';
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
            <Icon src={iconArrowLeft} className='⁂-chat-widget__back-icon' />
          </button>

          <span className='⁂-chat-widget__title-text'>
            <FormattedMessage id='chat_search.title' defaultMessage='Messages' />
          </span>
        </div>
      }
      isOpen={isOpen}
      isToggleable={false}
      onToggle={toggleChatPane}
    />
  );
};

export { ChatSearchHeader as default };
