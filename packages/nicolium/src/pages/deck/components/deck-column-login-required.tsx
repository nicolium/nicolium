import React from 'react';
import { FormattedMessage } from 'react-intl';

interface IDeckColumnLoginRequired {
  accountUrl: string;
}

const DeckColumnLoginRequired: React.FC<IDeckColumnLoginRequired> = ({ accountUrl }) => (
  <div className='deck__column__content'>
    <p>
      <FormattedMessage
        id='column.deck.login_required'
        defaultMessage='You need to log in to {accountUrl} to view this column.'
        values={{ accountUrl: <strong>{accountUrl}</strong> }}
      />
    </p>
  </div>
);

export { DeckColumnLoginRequired };
