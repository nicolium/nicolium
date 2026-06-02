import React from 'react';
import { FormattedMessage } from 'react-intl';

const Blankslate = () => (
  <div className='chat-search__blankslate'>
    <p className='chat-search__blankslate__title'>
      <FormattedMessage id='chat_search.blankslate.title' defaultMessage='Start a chat' />
    </p>
    <p className='chat-search__blankslate__body'>
      <FormattedMessage
        id='chat_search.blankslate.body'
        defaultMessage='Search for someone to chat with.'
      />
    </p>
  </div>
);

export { Blankslate as default };
