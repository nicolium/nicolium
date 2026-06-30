import iconArrowLeft from '@phosphor-icons/core/regular/arrow-left.svg';
import iconArrowRight from '@phosphor-icons/core/regular/arrow-right.svg';
import iconDotsThreeVertical from '@phosphor-icons/core/regular/dots-three-vertical.svg';
import iconFrameCorners from '@phosphor-icons/core/regular/frame-corners.svg';
import iconTrash from '@phosphor-icons/core/regular/trash.svg';
import iconChevronsLeftRight from 'lucide-static/icons/chevrons-left-right.svg';
import iconChevronsRightLeft from 'lucide-static/icons/chevrons-right-left.svg';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';

import DropdownMenu, { type Menu } from '@/components/dropdown-menu';
import { CardHeader, CardTitle } from '@/components/ui/card';

import { deckMessages as messages } from '../utils/messages';

import { type IDeckColumn, WIDTHS } from './deck-column';
import { DeckColumnAccountButton } from './deck-column-account';
import { updateDeckColumn, useColumnTitle } from './deck-column-config';

type IDeckColumnHeader = Omit<IDeckColumn, 'highlight'>;

const DeckColumnHeader: React.FC<IDeckColumnHeader> = ({
  column,
  index,
  columns,
  onRemove,
  onChangeWidth,
  onChangeIndex,
  onChangeFill,
}) => {
  const intl = useIntl();

  const title = useColumnTitle(column);

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

  return (
    <CardHeader className='deck__column__header'>
      <div className='deck__column__header__title'>
        <DeckColumnAccountButton column={column} />
        <CardTitle title={title} />
      </div>
      <div className='deck__column__actions'>
        <DropdownMenu items={items} src={iconDotsThreeVertical} />
      </div>
    </CardHeader>
  );
};

export { DeckColumnHeader };
