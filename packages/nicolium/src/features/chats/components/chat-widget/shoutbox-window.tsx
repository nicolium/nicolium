import iconArrowLeft from '@phosphor-icons/core/regular/arrow-left.svg';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Avatar from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
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
          <div className='chat-widget__title-row'>
            {isOpen && (
              <button onClick={closeChat} title={intl.formatMessage(messages.back)}>
                <Icon src={iconArrowLeft} className='chat-widget__back-icon' />
              </button>
            )}

            <div className='chat-widget__account__container'>
              {isOpen && <Avatar src={logo} alt='' size={40} className='chat-widget__avatar' />}

              <div className='chat-widget__account'>
                <div className='chat-widget__account__name'>
                  <span className='chat-widget__title-text'>
                    <FormattedMessage
                      id='chat_list_item_shoutbox'
                      defaultMessage='{instance} shoutbox'
                      values={{ instance: instance.title }}
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>
        }
        isToggleable={!isOpen}
        isOpen={isOpen}
        onToggle={toggleChatPane}
      />

      <div className='chat-widget__chat-body chat-widget__chat-body--shoutbox'>
        <Shoutbox />
      </div>
    </>
  );
};

export { ShoutboxWindow as default };
