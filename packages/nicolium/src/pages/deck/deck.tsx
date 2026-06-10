import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import HeadTitle from '@/components/helmet';
import { useSettings } from '@/stores/settings';
import toast from '@/toast';

import { DeckColumn } from './components/deck-column';
import { DeckColumnError } from './components/deck-column-error';
import { NewColumnButton } from './components/new-column-button';

import type { DeckColumn as DeckColumnSchema } from '@/schemas/frontend-settings';

const messages = defineMessages({
  deck: { id: 'column.deck', defaultMessage: 'Deck' },
  columnRemoved: { id: 'column.deck.remove.success', defaultMessage: 'Column removed' },
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
  const fadeRef = useRef<HTMLDivElement>(null);

  const [addedColumnId, setAddedColumnId] = useState<string | null>(null);
  const knownColumnIds = useRef<Set<string> | null>(null);
  const [isNearLeft, setNearLeft] = useState<boolean>(true);

  useEffect(() => {
    const scrollContainer = fadeRef.current?.parentElement?.parentElement;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollLeft = scrollContainer.scrollLeft;
      setNearLeft(scrollLeft < 32);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, []);

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

  const updateColumns = (
    updateFn: (oldColumns: Array<DeckColumnSchema>) => Array<DeckColumnSchema>,
  ) => changeSetting(['deck', 'columns'], updateFn);

  const handleRemove = (id: string) => {
    updateColumns((columns) => columns.filter((column) => column.id !== id));
    toast.success(messages.columnRemoved);
  };

  const handleChangeWidth = (id: string, newWidth: DeckColumnSchema['columnWidth']) =>
    updateColumns((columns) =>
      columns.map((column) => (column.id === id ? { ...column, columnWidth: newWidth } : column)),
    );

  const handleChangeIndex = (id: string, newIndex: number) => {
    updateColumns((columns) => {
      const oldIndex = columns.findIndex((column) => column.id === id);
      if (oldIndex === -1) return columns;
      const column = columns.splice(oldIndex, 1)[0];
      columns.splice(newIndex, 0, column);
      return [...columns];
    });
  };

  const handleToggleFill = (id: string) => {
    updateColumns((columns) =>
      columns.map((column) =>
        column.id === id ? { ...column, fillAvailableWidth: !column.fillAvailableWidth } : column,
      ),
    );
  };

  return (
    <>
      <HeadTitle title={intl.formatMessage(messages.deck)} />
      <div className='deck'>
        <div
          className={clsx('deck__fade', {
            'deck__fade--visible': !isNearLeft,
          })}
          ref={fadeRef}
        />
        <div className='deck__columns'>
          {deck.columns.map((column, index) => (
            <ColumnErrorBoundary
              key={column.id}
              fallback={
                <DeckColumnError
                  column={column}
                  index={index}
                  columns={deck.columns.length}
                  onRemove={handleRemove}
                />
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
                onToggleFill={handleToggleFill}
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
