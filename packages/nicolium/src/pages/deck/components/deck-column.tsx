import { RouterProvider } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useEffect, useMemo, useRef } from 'react';

import { Hotkeys } from '@/components/hotkeys';
import { CurrentAccountProvider } from '@/contexts/current-account-context';
import { DeckColumnIdContext } from '@/contexts/deck-column-id-context';
import { useFeatures } from '@/hooks/use-features';
import { useAuthStore } from '@/stores/auth';
import { useInstance } from '@/stores/instance';

import {
  focusDeckColumn,
  forgetColumnFocus,
  rememberColumnFocus,
  restoreStatusFocus,
} from '../utils/column-focus';
import { switchToNextLayout, switchToPreviousLayout } from '../utils/layouts';

import { useColumnNotFound } from './deck-column-config';
import { DeckColumnHeader } from './deck-column-header';
import { DeckColumnLoginRequired } from './deck-column-login-required';
import { DeckColumnNotFound } from './deck-column-not-found';
import { getDeckColumnRouter } from './deck-column-router';

import type { DeckColumn as DeckColumnConfig } from '@/schemas/frontend-settings';

const WIDTHS = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

interface DeckRouterContext {
  instance: ReturnType<typeof useInstance>;
  features: ReturnType<typeof useFeatures>;
}

interface IDeckColumn {
  column: DeckColumnConfig;
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
  const lastFocusedId = useRef<string | null>(null);

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

  useEffect(() => {
    const columnElement = columnRef.current;
    if (!columnElement) return;

    const handleFocusIn = (event: FocusEvent) => {
      const focusable = (event.target as HTMLElement | null)?.closest<HTMLElement>('.focusable');
      if (!focusable || focusable === columnElement || !columnElement.contains(focusable)) return;

      rememberColumnFocus(column.id, focusable);
      let focusedId;
      if (focusable.hasAttribute('data-status-id')) {
        focusedId = `status:${focusable.getAttribute('data-status-id')}`;
      } else if (focusable.hasAttribute('data-chat-id')) {
        focusedId = `chat:${focusable.getAttribute('data-chat-id')}`;
      } else if (focusable.hasAttribute('data-file-id')) {
        focusedId = `file:${focusable.getAttribute('data-file-id')}`;
      }
      if (focusedId) lastFocusedId.current = focusedId;
    };

    columnElement.addEventListener('focusin', handleFocusIn);
    return () => {
      columnElement.removeEventListener('focusin', handleFocusIn);
      forgetColumnFocus(column.id);
    };
  }, [column.id]);

  useEffect(() => {
    const getIndex = () =>
      (router.history.location.state as { __TSR_index?: number } | undefined)?.__TSR_index ?? null;

    let prevIndex = getIndex();

    return router.history.subscribe(({ action }: { action?: { type?: string } }) => {
      const nextIndex = getIndex();
      const wentBack =
        action?.type === 'BACK' ||
        action?.type === 'POP' ||
        (prevIndex !== null && nextIndex !== null && nextIndex < prevIndex);
      prevIndex = nextIndex;

      if (!wentBack) return;

      const columnElement = columnRef.current;
      const focusedId = lastFocusedId.current;
      if (!columnElement || !focusedId) return;

      const active = document.activeElement;
      if (active && active !== document.body && !columnElement.contains(active)) return;

      restoreStatusFocus(columnElement, focusedId);
    });
  }, [router]);

  const context: DeckRouterContext = useMemo(
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
      focusDeckColumn(
        document.querySelector<HTMLDivElement>(`.deck__column[data-index="${prevIndex}"]`),
      );
    },
    focusNextColumn: (event: KeyboardEvent) => {
      if (
        document.body.classList.contains('with-modals') ||
        (event.target instanceof HTMLElement && event.target.closest('[data-reach-tab-list]'))
      )
        return false;

      const nextIndex = index + 1;
      if (nextIndex >= columns) return;
      focusDeckColumn(
        document.querySelector<HTMLDivElement>(`.deck__column[data-index="${nextIndex}"]`),
      );
    },
    moveColumnLeft: () => {
      onChangeIndex(column.id, index - 1);
    },
    moveColumnRight: () => {
      onChangeIndex(column.id, index + 1);
    },
    switchToPreviousLayout,
    switchToNextLayout,
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
        'deck-column--login-required': loginRequired,
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
