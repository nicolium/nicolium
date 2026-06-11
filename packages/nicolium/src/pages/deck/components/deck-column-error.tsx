import clsx from 'clsx';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { CardHeader, CardTitle } from '@/components/ui/card';
import { Hotkeys } from '@/features/ui/components/hotkeys';

import type { DeckColumn } from '@/schemas/frontend-settings';

interface IDeckColumnError {
  column: DeckColumn;
  index: number;
  columns: number;
  onRemove: (id: string) => void;
  onChangeIndex: (id: string, newIndex: number) => void;
}

const DeckColumnError: React.FC<IDeckColumnError> = ({
  column,
  index,
  columns,
  onRemove,
  onChangeIndex,
}) => {
  const handlers = {
    focusPreviousColumn: (event: KeyboardEvent) => {
      if (
        document.body.classList.contains('with-modals') ||
        (event.target instanceof HTMLElement && event.target.closest('[data-reach-tab-list]'))
      )
        return false;

      const prevIndex = index - 1;
      if (prevIndex < 0) return;
      const prevColumn = document.querySelector<HTMLDivElement>(
        `.deck__column[data-index="${prevIndex}"]`,
      );
      prevColumn?.focus();
    },
    focusNextColumn: (event: KeyboardEvent) => {
      if (
        document.body.classList.contains('with-modals') ||
        (event.target instanceof HTMLElement && event.target.closest('[data-reach-tab-list]'))
      )
        return false;

      const nextIndex = index + 1;
      if (nextIndex >= columns) return;
      const nextColumn = document.querySelector<HTMLDivElement>(
        `.deck__column[data-index="${nextIndex}"]`,
      );
      nextColumn?.focus();
    },
    handleMoveLeft: () => {
      if (index === 0) return;
      onChangeIndex(column.id, index - 1);
    },
    handleMoveRight: () => {
      if (index === columns - 1) return;
      onChangeIndex(column.id, index + 1);
    },
  };

  return (
    <Hotkeys
      handlers={handlers}
      className={clsx('deck__column deck__column--error', `deck__column--${column.columnWidth}`)}
      tabIndex={-1}
      data-index={index}
      data-column-id={column.id}
    >
      <CardHeader className='deck__column__header'>
        <CardTitle
          title={<FormattedMessage id='column.deck.error.heading' defaultMessage='Column error' />}
        />
      </CardHeader>
      <div className='deck__column__content'>
        <FormattedMessage id='column.deck.error' defaultMessage='Failed to load column' />
        <button onClick={() => onRemove(column.id)}>
          <FormattedMessage id='column.deck.remove' defaultMessage='Remove column' />
        </button>
      </div>
    </Hotkeys>
  );
};

export { DeckColumnError };
