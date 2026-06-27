import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import type { DeckColumnResource } from './deck-column-config';

const messages = defineMessages({
  list: {
    id: 'column.deck.not_found.list',
    defaultMessage:
      'This list could not be found. It might have been deleted or you don’t have permission to view it.',
  },
  circle: {
    id: 'column.deck.not_found.circle',
    defaultMessage:
      'This circle could not be found. It might have been deleted or you don’t have permission to view it.',
  },
  antenna: {
    id: 'column.deck.not_found.antenna',
    defaultMessage:
      'This antenna could not be found. It might have been deleted or you don’t have permission to view it.',
  },
  account: {
    id: 'column.deck.not_found.account',
    defaultMessage: 'This profile could not be found. It might have been deleted or suspended.',
  },
  chat: {
    id: 'column.deck.not_found.chat',
    defaultMessage: 'This chat could not be found.',
  },
  bookmarks: {
    id: 'column.deck.not_found.bookmarks',
    defaultMessage:
      'This bookmark folder could not be found. It might have been deleted or you don’t have permission to view it.',
  },
  remove: { id: 'column.deck.remove', defaultMessage: 'Remove column' },
});

interface IDeckColumnNotFound {
  resource: DeckColumnResource;
  onRemove: () => void;
}

const DeckColumnNotFound: React.FC<IDeckColumnNotFound> = ({ resource, onRemove }) => {
  const intl = useIntl();

  return (
    <div className='deck__column__content'>
      <p>{intl.formatMessage(messages[resource])}</p>
      <button onClick={onRemove}>{intl.formatMessage(messages.remove)}</button>
    </div>
  );
};

export { DeckColumnNotFound };
