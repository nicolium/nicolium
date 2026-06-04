import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

/** To display on the chats main page when no message is selected, but chats are present. */
const BlankslateWithChats = () => {
  const navigate = useNavigate();

  const handleNewChat = () => {
    navigate({ to: '/chats/new' });
  };

  return (
    <div className='chats-page-blankslate'>
      <div className='chats-page-blankslate__content'>
        <h2 className='chats-page-blankslate__title'>
          <FormattedMessage
            id='chats.main.blankslate_with_chats.title'
            defaultMessage='Select a chat'
          />
        </h2>

        <p className='chats-page-blankslate__body'>
          <FormattedMessage
            id='chats.main.blankslate_with_chats.subtitle'
            defaultMessage='Select from one of your open chats or create a new message.'
          />
        </p>
      </div>

      <button className='chats-page-blankslate__action' onClick={handleNewChat}>
        <FormattedMessage id='chats.main.blankslate.new_chat' defaultMessage='Message someone' />
      </button>
    </div>
  );
};

export { BlankslateWithChats as default };
