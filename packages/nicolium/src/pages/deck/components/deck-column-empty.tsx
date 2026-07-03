import clsx from 'clsx';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { CardHeader, CardTitle } from '@/components/ui/card';

import { NewColumnButton } from './new-column-button';

const DeckColumnEmpty: React.FC = () => {
  return (
    <div className={clsx('deck__column deck__column--empty')} tabIndex={-1} data-index={0}>
      <CardHeader className='deck__column__header'>
        <CardTitle
          title={
            <FormattedMessage id='column.deck.empty.heading' defaultMessage='No deck columns' />
          }
        />
      </CardHeader>
      <div className='deck__column__content'>
        <FormattedMessage
          id='column.deck.empty.message'
          defaultMessage='Add a column to get started'
        />
        <NewColumnButton />
      </div>
    </div>
  );
};

export { DeckColumnEmpty };
