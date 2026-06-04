import { Link } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

/** To display on the chats main page when no message is selected. */
const BlankslateEmpty: React.FC = () => (
  <div className='chats-page-blankslate'>
    <div className='chats-page-blankslate__content'>
      <h2 className='chats-page-blankslate__title'>
        <FormattedMessage id='chats.main.blankslate.title' defaultMessage='No messages yet' />
      </h2>

      <p className='chats-page-blankslate__body'>
        <FormattedMessage
          id='chats.main.blankslate.subtitle'
          defaultMessage='Search for someone to chat with'
        />
      </p>
    </div>

    <Link className='chats-page-blankslate__action' to='/chats/new'>
      <FormattedMessage id='chats.main.blankslate.new_chat' defaultMessage='Message someone' />
    </Link>
  </div>
);

export { BlankslateEmpty as default };
