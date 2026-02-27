import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  title: { id: 'chat_pane.blankslate.title', defaultMessage: 'No messages yet' },
  body: { id: 'chat_pane.blankslate.body', defaultMessage: 'Search for someone to chat with.' },
  action: { id: 'chat_pane.blankslate.action', defaultMessage: 'Message someone' },
});

interface IBlankslate {
  onSearch(): void;
}

const Blankslate = ({ onSearch }: IBlankslate) => {
  const intl = useIntl();

  return (
    <div className='⁂-chat-widget__blankslate' data-testid='chat-pane-blankslate'>
      <div className='⁂-chat-widget__blankslate__text'>
        <p className='⁂-chat-widget__blankslate__text__title'>
          {intl.formatMessage(messages.title)}
        </p>

        <p className='⁂-chat-widget__blankslate__text__body'>{intl.formatMessage(messages.body)}</p>
      </div>

      <button onClick={onSearch}>{intl.formatMessage(messages.action)}</button>
    </div>
  );
};

export { Blankslate as default };
