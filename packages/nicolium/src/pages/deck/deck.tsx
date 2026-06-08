import React, { useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import HeadTitle from '@/components/helmet';
import { useSettings } from '@/stores/settings';

import { DeckColumn } from './components/deck-column';
import { NewColumnButton } from './components/new-column-button';

import type { DeckColumn as DeckColumnSchema } from '@/schemas/frontend-settings';

const messages = defineMessages({
  deck: { id: 'column.deck', defaultMessage: 'Deck' },
});

interface IColumnErrorBoundary {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

class ColumnErrorBoundary extends React.Component<IColumnErrorBoundary, { hasError: boolean }> {
  constructor(props: IColumnErrorBoundary) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  // componentDidCatch(error, info) {
  // }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback;
    }

    return this.props.children;
  }
}

const DeckPage = () => {
  const intl = useIntl();
  const { deck } = useSettings();

  const [addedColumnId, setAddedColumnId] = useState<string | null>(null);
  const knownColumnIds = useRef<Set<string> | null>(null);

  useEffect(() => {
    const currentIds = deck.columns.map((column) => column.id);

    if (knownColumnIds.current === null) {
      knownColumnIds.current = new Set(currentIds);
      return;
    }

    const added = currentIds.find((id) => !knownColumnIds.current!.has(id));
    knownColumnIds.current = new Set(currentIds);

    if (added) setAddedColumnId(added);
  }, [deck.columns]);

  useEffect(() => {
    if (!addedColumnId) return;
    const timeout = setTimeout(() => setAddedColumnId(null), 22000);
    return () => clearTimeout(timeout);
  }, [addedColumnId]);

  const updateColumns = (columns: Array<DeckColumnSchema>) =>
    changeSetting(['deck', 'columns'], columns);

  const handleRemove = (id: string) =>
    updateColumns(deck.columns.filter((column) => column.id !== id));

  const handleChangeWidth = (id: string, newWidth: DeckColumnSchema['columnWidth']) =>
    updateColumns(
      deck.columns.map((column) =>
        column.id === id ? { ...column, columnWidth: newWidth } : column,
      ),
    );

  const handleChangeIndex = (id: string, newIndex: number) => {
    const updatedColumns = [...deck.columns];
    const oldIndex = updatedColumns.findIndex((column) => column.id === id);
    if (oldIndex === -1) return;
    const column = updatedColumns.splice(oldIndex, 1)[0];
    updatedColumns.splice(newIndex, 0, column);
    updateColumns(updatedColumns);
  };

  return (
    <>
      <HeadTitle title={intl.formatMessage(messages.deck)} />
      <div className='deck'>
        <div className='deck__columns'>
          {deck.columns.map((column, index) => (
            <ColumnErrorBoundary
              key={column.id}
              fallback={
                <div
                  className={`deck__column deck__column--error deck__column--${column.columnWidth}`}
                >
                  <FormattedMessage id='column.deck.error' defaultMessage='Failed to load column' />
                </div>
              }
            >
              <DeckColumn
                column={column}
                index={index}
                columns={deck.columns.length}
                highlight={column.id === addedColumnId}
                onRemove={handleRemove}
                onChangeWidth={handleChangeWidth}
                onChangeIndex={handleChangeIndex}
              />
            </ColumnErrorBoundary>
          ))}
        </div>
        <NewColumnButton />
      </div>
    </>
  );
};

export { DeckPage as default };
