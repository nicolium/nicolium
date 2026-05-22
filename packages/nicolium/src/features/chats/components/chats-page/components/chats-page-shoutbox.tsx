import iconArrowLeft from '@phosphor-icons/core/regular/arrow-left.svg';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Avatar from '@/components/ui/avatar';
import IconButton from '@/components/ui/icon-button';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useInstance } from '@/stores/instance';

import Shoutbox from '../../shoutbox';

const messages = defineMessages({
  back: { id: 'chats.back', defaultMessage: 'Back to chats' },
});

const ChatsPageShoutbox = () => {
  const navigate = useNavigate();
  const intl = useIntl();
  const instance = useInstance();
  const { logo } = useFrontendConfig();

  return (
    <div className='⁂-chats-page-chat'>
      <div className='⁂-chats-page-chat__header'>
        <div className='⁂-chats-page-chat__avatar__container'>
          <IconButton
            src={iconArrowLeft}
            className='⁂-chats-page-chat__back-button'
            onClick={() => navigate({ to: '/chats' })}
            title={intl.formatMessage(messages.back)}
          />

          <Avatar src={logo} alt='' size={40} className='⁂-chats-page-chat__avatar' />
        </div>

        <div className='⁂-chats-page-chat__title'>
          <span className='⁂-chats-page-chat__title__name ⁂-chats-page-chat__title__text'>
            <FormattedMessage
              id='chat_list_item_shoutbox'
              defaultMessage='{instance} shoutbox'
              values={{ instance: instance.title }}
            />
          </span>
        </div>
      </div>

      <div className='⁂-chats-page-chat__body'>
        <Shoutbox className='⁂-chats-page-chat__chat' />
      </div>
    </div>
  );
};

export { ChatsPageShoutbox as default };
