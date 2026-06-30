import { RouterProvider } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useEffect, useMemo, useRef } from 'react';

import { CurrentAccountProvider } from '@/contexts/current-account-context';
import { Hotkeys } from '@/features/ui/components/hotkeys';
import { useFeatures } from '@/hooks/use-features';
import { useAuthStore } from '@/stores/auth';
import { useInstance } from '@/stores/instance';

import { DeckColumnIdContext, useColumnNotFound } from './deck-column-config';
import { DeckColumnHeader } from './deck-column-header';
import { DeckColumnLoginRequired } from './deck-column-login-required';
import { DeckColumnNotFound } from './deck-column-not-found';
import { getDeckColumnRouter } from './deck-column-router';

import type { DeckColumn } from '@/schemas/frontend-settings';

const WIDTHS = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

interface RouterContext {
  instance: ReturnType<typeof useInstance>;
  features: ReturnType<typeof useFeatures>;
}

interface IDeckColumn {
  column: DeckColumn;
  index: number;
  columns: number;
  highlight?: boolean;
  onRemove: (id: string) => void;
  onChangeWidth: (id: string, newWidth: (typeof WIDTHS)[number]) => void;
  onChangeIndex: (id: string, newIndex: number) => void;
  onChangeFill: (id: string, value: boolean) => void;
}

interface IDeckColumnInner extends IDeckColumn {
  loginRequired?: boolean;
}

const DeckColumnInner: React.FC<IDeckColumnInner> = ({
  column,
  index,
  columns,
  highlight,
  loginRequired,
  onRemove,
  onChangeWidth,
  onChangeIndex,
  onChangeFill,
}) => {
  const instance = useInstance();
  const features = useFeatures();
  const notFoundResource = useColumnNotFound(column);
  const router = getDeckColumnRouter(column);
  const columnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlight) {
      columnRef.current?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'center',
      });
      columnRef.current?.focus();
    }
  }, [highlight]);

  const context: RouterContext = useMemo(
    () => ({
      instance,
      features,
    }),
    [features.version],
  );

  const backHandler = () => {
    if (document.body.classList.contains('with-modals')) return;

    if (router.history.canGoBack()) {
      router.history.back();
    } else {
      return false;
    }
  };

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
    moveColumnLeft: () => {
      onChangeIndex(column.id, index - 1);
    },
    moveColumnRight: () => {
      onChangeIndex(column.id, index + 1);
    },
    shrinkColumn: () => {
      const newWidth = WIDTHS[WIDTHS.indexOf(column.columnWidth) - 1];
      if (!newWidth) return;
      onChangeWidth(column.id, newWidth);
    },
    widenColumn: () => {
      const newWidth = WIDTHS[WIDTHS.indexOf(column.columnWidth) + 1];
      if (!newWidth) return;
      onChangeWidth(column.id, newWidth);
    },
    moveDown: () => {
      if (!columnRef.current) return;
      columnRef.current.querySelector<HTMLDivElement>('.focusable')?.focus();
    },
    back: backHandler,
    columnBack: backHandler,
  };

  return (
    <Hotkeys
      handlers={handlers}
      ref={columnRef}
      className={clsx('deck__column', `deck__column--${column.columnWidth}`, {
        'deck__column--highlight': highlight,
        'deck__column--fill': column.fillAvailableWidth,
        'deck__column--not-found': !!notFoundResource || loginRequired,
      })}
      tabIndex={-1}
      data-index={index}
      data-column-id={column.id}
    >
      <DeckColumnHeader
        column={column}
        index={index}
        columns={columns}
        onRemove={onRemove}
        onChangeWidth={onChangeWidth}
        onChangeIndex={onChangeIndex}
        onChangeFill={onChangeFill}
      />
      {loginRequired && column.accountUrl ? (
        <DeckColumnLoginRequired accountUrl={column.accountUrl} />
      ) : notFoundResource ? (
        <DeckColumnNotFound resource={notFoundResource} onRemove={() => onRemove(column.id)} />
      ) : (
        <DeckColumnIdContext.Provider value={column.id}>
          <RouterProvider router={router} context={context} />
        </DeckColumnIdContext.Provider>
      )}
    </Hotkeys>
  );
};

const DeckColumn: React.FC<IDeckColumn> = (props) => {
  const { accountUrl } = props.column;
  const isKnownAccount = useAuthStore((state) =>
    accountUrl ? !!state.users[accountUrl]?.id : false,
  );

  if (accountUrl && isKnownAccount) {
    return (
      <CurrentAccountProvider accountUrl={accountUrl}>
        <DeckColumnInner {...props} />
      </CurrentAccountProvider>
    );
  }

  return <DeckColumnInner {...props} loginRequired={!!accountUrl && !isKnownAccount} />;
};

export { DeckColumn, type IDeckColumn, WIDTHS };
