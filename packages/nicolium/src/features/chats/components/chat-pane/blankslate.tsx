import React from 'react';
import { FormattedMessage } from 'react-intl';

interface IBlankslate {
  onSearch(): void;
}

const Blankslate = ({ onSearch }: IBlankslate) => (
  <div className='⁂-chat-widget__blankslate' data-testid='chat-pane-blankslate'>
    <div className='⁂-chat-widget__blankslate__text'>
      <p className='⁂-chat-widget__blankslate__text__title'>
        <FormattedMessage id='chat_pane.blankslate.title' defaultMessage='No messages yet' />
      </p>

      <p className='⁂-chat-widget__blankslate__text__body'>
        <FormattedMessage
          id='chat_pane.blankslate.body'
          defaultMessage='Search for someone to chat with.'
        />
      </p>
    </div>

    <button onClick={onSearch}>
      <FormattedMessage id='chat_pane.blankslate.action' defaultMessage='Message someone' />
    </button>
  </div>
);

export { Blankslate as default };
