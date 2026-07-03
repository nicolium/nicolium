import React from 'react';
import { FormattedMessage } from 'react-intl';

import { CardHeader, CardTitle } from '@/components/ui/card';
import { Hotkeys } from '@/features/ui/components/hotkeys';

import { switchToPreviousLayout, switchToNextLayout } from '../utils/layouts';

import { NewColumnButton } from './new-column-button';

interface IDeckColumnEmpty {
  hasMultipleLayouts?: boolean;
}

const DeckColumnEmpty: React.FC<IDeckColumnEmpty> = ({ hasMultipleLayouts = false }) => {
  const handlers = {
    switchToPreviousLayout,
    switchToNextLayout,
  };

  return (
    <Hotkeys
      handlers={handlers}
      className='deck__column deck__column--empty'
      tabIndex={-1}
      data-index={0}
    >
      <CardHeader className='deck__column__header'>
        <CardTitle
          title={
            hasMultipleLayouts ? (
              <FormattedMessage
                id='column.deck.empty.heading.multiple_layouts'
                defaultMessage='Empty deck layout'
              />
            ) : (
              <FormattedMessage id='column.deck.empty.heading' defaultMessage='No deck columns' />
            )
          }
        />
      </CardHeader>
      <div className='deck__column__content'>
        {hasMultipleLayouts ? (
          <FormattedMessage
            id='column.deck.empty.message.multiple_layouts'
            defaultMessage='Add a column to get started or switch to a different layout'
          />
        ) : (
          <FormattedMessage
            id='column.deck.empty.message'
            defaultMessage='Add a column to get started'
          />
        )}
        <NewColumnButton />
      </div>
    </Hotkeys>
  );
};

export { DeckColumnEmpty };
