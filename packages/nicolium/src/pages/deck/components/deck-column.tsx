import iconArrowLeft from '@phosphor-icons/core/regular/arrow-left.svg';
import iconArrowRight from '@phosphor-icons/core/regular/arrow-right.svg';
import iconDotsThreeVertical from '@phosphor-icons/core/regular/dots-three-vertical.svg';
import iconFrameCorners from '@phosphor-icons/core/regular/frame-corners.svg';
import iconTrash from '@phosphor-icons/core/regular/trash.svg';
import { RouterProvider } from '@tanstack/react-router';
import clsx from 'clsx';
import iconChevronsLeftRight from 'lucide-static/icons/chevrons-left-right.svg';
import iconChevronsRightLeft from 'lucide-static/icons/chevrons-right-left.svg';
import React, { useEffect, useMemo, useRef } from 'react';
import { useIntl } from 'react-intl';

import DropdownMenu, { type Menu } from '@/components/dropdown-menu';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { CurrentAccountProvider } from '@/contexts/current-account-context';
import { Hotkeys } from '@/features/ui/components/hotkeys';
import { useFeatures } from '@/hooks/use-features';
import { useAuthStore } from '@/stores/auth';
import { useInstance } from '@/stores/instance';

import { deckMessages as messages } from '../utils/messages';

import { DeckColumnAccountButton } from './deck-column-account';
import { DeckColumnIdContext, updateDeckColumn, useColumnTitle } from './deck-column-config';
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

const DeckColumnInner: React.FC<IDeckColumn> = ({
  column,
  index,
  columns,
  highlight,
  onRemove,
  onChangeWidth,
  onChangeIndex,
  onChangeFill,
}) => {
  const intl = useIntl();
  const instance = useInstance();
  const features = useFeatures();
  const title = useColumnTitle(column);
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

  const items = useMemo(() => {
    const handleWiden = () => {
      const newWidth = WIDTHS[WIDTHS.indexOf(column.columnWidth) + 1];
      if (!newWidth) return;
      onChangeWidth(column.id, newWidth);
    };

    const handleShrink = () => {
      const newWidth = WIDTHS[WIDTHS.indexOf(column.columnWidth) - 1];
      if (!newWidth) return;
      onChangeWidth(column.id, newWidth);
    };

    const handleChangeFill = (value: boolean) => {
      onChangeFill(column.id, value);
    };

    const handleMoveLeft = () => {
      if (index === 0) return;
      onChangeIndex(column.id, index - 1);
    };

    const handleMoveRight = () => {
      if (index === columns - 1) return;
      onChangeIndex(column.id, index + 1);
    };

    const menu: Menu = [
      {
        text: intl.formatMessage(messages.widen),
        icon: iconChevronsLeftRight,
        action: handleWiden,
        disabled: column.columnWidth === 'xl',
      },
      {
        text: intl.formatMessage(messages.shrink),
        icon: iconChevronsRightLeft,
        action: handleShrink,
        disabled: column.columnWidth === 'xs',
      },
      {
        text: intl.formatMessage(messages.fill),
        icon: iconFrameCorners,
        onChange: (value) => handleChangeFill(value),
        type: 'toggle',
        checked: column.fillAvailableWidth,
      },
      {
        text: intl.formatMessage(messages.moveLeft),
        icon: iconArrowLeft,
        action: handleMoveLeft,
        disabled: index === 0,
      },
      {
        text: intl.formatMessage(messages.moveRight),
        icon: iconArrowRight,
        action: handleMoveRight,
        disabled: index === columns - 1,
      },
      null,
      {
        text: intl.formatMessage(messages.remove),
        icon: iconTrash,
        action: () => onRemove(column.id),
        destructive: true,
      },
    ];

    if (column.type === 'account') {
      menu.unshift(
        {
          text: intl.formatMessage(messages.showReplies),
          type: 'toggle',
          checked: !column.excludeReplies,
          onChange: (value) => updateDeckColumn(column.id, { excludeReplies: !value }),
        },
        {
          text: intl.formatMessage(messages.showPinned),
          type: 'toggle',
          checked: column.showPinned,
          onChange: (value) => updateDeckColumn(column.id, { showPinned: value }),
        },
        null,
      );
    }

    return menu;
  }, [intl, index, columns, column]);

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
      })}
      tabIndex={-1}
      data-index={index}
      data-column-id={column.id}
    >
      <CardHeader className='deck__column__header'>
        <div className='deck__column__header__title'>
          <DeckColumnAccountButton column={column} />
          <CardTitle title={title} />
        </div>
        <div className='deck__column__actions'>
          <DropdownMenu items={items} src={iconDotsThreeVertical} />
        </div>
      </CardHeader>
      <DeckColumnIdContext.Provider value={column.id}>
        <RouterProvider router={router} context={context} />
      </DeckColumnIdContext.Provider>
    </Hotkeys>
  );
};

/**
 * Renders a deck column, optionally scoped to a specific logged-in account.
 * When the column is pinned to a logged-in account, its whole subtree (title,
 * features, queries and the embedded router) runs as that account.
 */
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

  return <DeckColumnInner {...props} />;
};

export { DeckColumn };
