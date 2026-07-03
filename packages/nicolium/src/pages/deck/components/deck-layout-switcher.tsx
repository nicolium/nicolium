import iconCaretDown from '@phosphor-icons/core/regular/caret-down.svg';
import iconPencilSimple from '@phosphor-icons/core/regular/pencil-simple.svg';
import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import iconSquaresFour from '@phosphor-icons/core/regular/squares-four.svg';
import iconTrash from '@phosphor-icons/core/regular/trash.svg';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import DropdownMenu, { type Menu } from '@/components/dropdown-menu';
import Icon from '@/components/ui/icon';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';

import {
  createDeckLayout,
  getActiveLayout,
  removeDeckLayout,
  renameDeckLayout,
  switchDeckLayout,
} from '../utils/layouts';

import type { DeckLayout } from '@/schemas/frontend-settings';

const messages = defineMessages({
  label: { id: 'deck.layouts.label', defaultMessage: 'Deck layouts' },
  unnamed: { id: 'deck.layouts.unnamed', defaultMessage: 'Layout {number}' },
  newLayout: { id: 'deck.layouts.new', defaultMessage: 'New layout' },
  rename: { id: 'deck.layouts.rename', defaultMessage: 'Rename layout' },
  renamePlaceholder: { id: 'deck.layouts.rename.placeholder', defaultMessage: 'Layout name' },
  renameConfirm: { id: 'deck.layouts.rename.confirm', defaultMessage: 'Save' },
  delete: { id: 'deck.layouts.delete', defaultMessage: 'Delete layout' },
  deleteConfirm: { id: 'confirmations.deck.delete_layout.confirm', defaultMessage: 'Delete' },
});

const DeckLayoutSwitcher: React.FC = () => {
  const intl = useIntl();
  const { openModal } = useModalsActions();
  const deck = useSettings().deck;
  const activeLayout = getActiveLayout(deck);

  const layoutName = (layout: DeckLayout, index: number) =>
    layout.name || intl.formatMessage(messages.unnamed, { number: index + 1 });

  const handleRename = () => {
    openModal('TEXT_FIELD', {
      heading: <FormattedMessage id='deck.layouts.rename' defaultMessage='Rename layout' />,
      placeholder: intl.formatMessage(messages.renamePlaceholder),
      confirm: intl.formatMessage(messages.renameConfirm),
      text: activeLayout.name,
      singleLine: true,
      onConfirm: (value) => renameDeckLayout(activeLayout.id, value.trim()),
    });
  };

  const handleDelete = () => {
    if (activeLayout.columns.length > 0) {
      openModal('CONFIRM', {
        heading: (
          <FormattedMessage
            id='confirmations.deck.delete_layout.heading'
            defaultMessage='Delete layout'
          />
        ),
        message: (
          <FormattedMessage
            id='confirmations.deck.delete_layout.message'
            defaultMessage='Are you sure you want to delete this deck layout?'
          />
        ),
        confirm: intl.formatMessage(messages.deleteConfirm),
        onConfirm: () => removeDeckLayout(activeLayout.id),
      });
    } else {
      removeDeckLayout(activeLayout.id);
    }
  };

  const items: Menu = [
    ...deck.layouts.map((layout, index) => ({
      text: layoutName(layout, index),
      type: 'radio' as const,
      checked: layout.id === activeLayout.id,
      onChange: () => switchDeckLayout(layout.id),
    })),
    null,
    { text: intl.formatMessage(messages.newLayout), icon: iconPlus, action: createDeckLayout },
    { text: intl.formatMessage(messages.rename), icon: iconPencilSimple, action: handleRename },
    {
      text: intl.formatMessage(messages.delete),
      icon: iconTrash,
      destructive: true,
      disabled: deck.layouts.length <= 1,
      action: handleDelete,
    },
  ];

  const activeIndex = deck.layouts.findIndex((layout) => layout.id === activeLayout.id);

  return (
    <DropdownMenu items={items} placement='top' width='14rem' forceDropdown>
      <button
        type='button'
        className='deck__layout-switcher'
        title={intl.formatMessage(messages.label)}
      >
        <Icon src={iconSquaresFour} className='deck__layout-switcher__icon' aria-hidden />
        <span className='deck__layout-switcher__name'>{layoutName(activeLayout, activeIndex)}</span>
        <Icon src={iconCaretDown} aria-hidden />
      </button>
    </DropdownMenu>
  );
};

export { DeckLayoutSwitcher };
