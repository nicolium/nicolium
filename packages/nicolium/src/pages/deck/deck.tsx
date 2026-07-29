import iconDeviceMobile from '@phosphor-icons/core/regular/device-mobile.svg';
import iconHouse from '@phosphor-icons/core/regular/house.svg';
import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import DropdownMenu, { type Menu } from '@/components/dropdown-menu';
import HeadTitle from '@/components/helmet';
import { useModalsActions } from '@/stores/modals';
import { useSettings, useSettingsStore } from '@/stores/settings';
import toast from '@/toast';

import { DeckColumn } from './components/deck-column';
import { DeckColumnEmpty } from './components/deck-column-empty';
import { DeckColumnError } from './components/deck-column-error';
import { DeckLayoutSwitcher } from './components/deck-layout-switcher';
import { NewColumnButton } from './components/new-column-button';
import { useActiveDeckColumns, updateActiveLayoutColumns, createDeckLayout } from './utils/layouts';

import type { DeckColumn as DeckColumnSchema } from '@/schemas/frontend-settings';

const messages = defineMessages({
  deck: { id: 'column.deck', defaultMessage: 'Deck' },
  columnRemoved: { id: 'column.deck.remove.success', defaultMessage: 'Column removed' },
  options: { id: 'deck.options', defaultMessage: 'Deck options' },
  useAsHomepage: { id: 'deck.use_as_homepage', defaultMessage: 'Use as homepage' },
  mobileFullWidth: {
    id: 'deck.mobile_full_width',
    defaultMessage: 'Fit columns to screen on mobile',
  },
  resetColumns: {
    id: 'deck.reset_columns',
    defaultMessage: 'Reset columns to default',
  },
  confirm: { id: 'confirmations.deck.reset_columns.confirm', defaultMessage: 'Reset' },
  newLayout: { id: 'deck.layouts.new', defaultMessage: 'New layout' },
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

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

const DeckPage: React.FC = () => {
  const intl = useIntl();
  const { deck, defaultTimeline } = useSettings();
  const columns = useActiveDeckColumns();
  const fadeRef = useRef<HTMLDivElement>(null);
  const { openModal } = useModalsActions();

  const [addedColumnId, setAddedColumnId] = useState<string | null>(null);
  const knownColumnIds = useRef<Set<string> | null>(null);
  const knownLayoutId = useRef<string | null>(null);
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
    const currentIds = columns.map((column) => column.id);

    if (knownColumnIds.current === null || knownLayoutId.current !== deck.activeLayout) {
      knownColumnIds.current = new Set(currentIds);
      knownLayoutId.current = deck.activeLayout;
      return;
    }

    const added = currentIds.find((id) => !knownColumnIds.current!.has(id));
    knownColumnIds.current = new Set(currentIds);

    if (added) setAddedColumnId(added);
  }, [columns, deck.activeLayout]);

  useEffect(() => {
    if (!addedColumnId) return;
    const timeout = setTimeout(() => setAddedColumnId(null), 22000);
    return () => clearTimeout(timeout);
  }, [addedColumnId]);

  const updateColumns = updateActiveLayoutColumns;

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
      const next = [...columns];
      const [column] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, column);
      return next;
    });
  };

  const handleChangeFill = (id: string, value: boolean) => {
    updateColumns((columns) =>
      columns.map((column) =>
        column.id === id ? { ...column, fillAvailableWidth: value } : column,
      ),
    );
  };

  const resetColumns = () => {
    openModal('CONFIRM', {
      heading: (
        <FormattedMessage
          id='confirmations.deck.reset_columns.heading'
          defaultMessage='Reset deck columns'
        />
      ),
      message: (
        <FormattedMessage
          id='confirmations.deck.reset_columns.message'
          defaultMessage='Are you sure you want to delete your current deck configuration?'
        />
      ),
      confirm: intl.formatMessage(messages.confirm),
      onConfirm: () =>
        updateColumns(() => useSettingsStore.getState().defaultSettings.deck.layouts[0].columns),
    });
  };

  const deckOptions: Menu = [
    {
      text: intl.formatMessage(messages.useAsHomepage),
      icon: iconHouse,
      type: 'toggle',
      checked: defaultTimeline === 'deck',
      onChange: (value) => changeSetting(['defaultTimeline'], value ? 'deck' : 'home'),
    },
    {
      text: intl.formatMessage(messages.mobileFullWidth),
      icon: iconDeviceMobile,
      type: 'toggle',
      checked: deck.mobileFullWidth,
      onChange: (value) => changeSetting(['deck', 'mobileFullWidth'], value),
    },
  ];

  if (deck.layouts.length === 1) {
    deckOptions.push(null, {
      text: intl.formatMessage(messages.newLayout),
      icon: iconPlus,
      action: createDeckLayout,
    });
  }

  deckOptions.push(null, {
    text: intl.formatMessage(messages.resetColumns),
    action: resetColumns,
    destructive: true,
  });

  return (
    <>
      <HeadTitle title={intl.formatMessage(messages.deck)} />
      <div
        className={clsx('deck', {
          'deck--mobile-full-width': deck.mobileFullWidth,
        })}
      >
        <div
          className={clsx('deck__fade', {
            'deck__fade--visible': !isNearLeft,
          })}
          ref={fadeRef}
        />
        <div className='deck__columns'>
          {columns.map((column, index) => (
            <ColumnErrorBoundary
              key={column.id}
              fallback={
                <DeckColumnError
                  column={column}
                  index={index}
                  columns={columns.length}
                  onRemove={handleRemove}
                  onChangeIndex={handleChangeIndex}
                />
              }
            >
              <DeckColumn
                column={column}
                index={index}
                columns={columns.length}
                highlight={column.id === addedColumnId}
                onRemove={handleRemove}
                onChangeWidth={handleChangeWidth}
                onChangeIndex={handleChangeIndex}
                onChangeFill={handleChangeFill}
              />
            </ColumnErrorBoundary>
          ))}
          {columns.length === 0 && <DeckColumnEmpty hasMultipleLayouts={deck.layouts.length > 1} />}
        </div>
        <div className='deck__sidebar'>
          <div className='deck__sidebar__top'>
            {deck.layouts.length > 1 && <DeckLayoutSwitcher />}
            <DropdownMenu
              items={deckOptions}
              forceDropdown
              title={intl.formatMessage(messages.options)}
            />
          </div>
          {columns.length > 0 && <NewColumnButton />}
          <div className='deck__sidebar__spacer' />
        </div>
      </div>
    </>
  );
};

export { DeckPage as default };
