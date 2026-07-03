import { defineMessages } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import { useSettings, useSettingsStore } from '@/stores/settings';
import toast from '@/toast';

import type { DeckColumn, DeckLayout, Settings } from '@/schemas/frontend-settings';

const messages = defineMessages({
  deckLayoutCreated: {
    id: 'deck.layouts.new.success',
    defaultMessage: 'Created new layout',
  },
  deckLayoutCreatedAction: {
    id: 'deck.layouts.new.success.action',
    defaultMessage: 'Switch to layout',
  },
  deckLayoutDeleted: {
    id: 'deck.layouts.delete.success',
    defaultMessage: 'Layout deleted',
  },
  deckLayoutRenamed: {
    id: 'deck.layouts.rename.success',
    defaultMessage: 'Layout renamed',
  },
});

type Deck = Settings['deck'];

const getActiveLayout = (deck: Deck): DeckLayout =>
  deck.layouts.find((layout) => layout.id === deck.activeLayout) ?? deck.layouts[0];

const useActiveDeckColumns = (): Array<DeckColumn> => getActiveLayout(useSettings().deck).columns;

const updateActiveLayoutColumns = (updateFn: (columns: Array<DeckColumn>) => Array<DeckColumn>) => {
  const deck = useSettingsStore.getState().settings.deck;
  const activeId = getActiveLayout(deck).id;

  changeSetting(
    ['deck', 'layouts'],
    deck.layouts.map((layout) =>
      layout.id === activeId ? { ...layout, columns: updateFn(layout.columns) } : layout,
    ),
  );
};

const switchDeckLayout = (id: string) => changeSetting(['deck', 'activeLayout'], id);

const createDeckLayout = () => {
  const deck = useSettingsStore.getState().settings.deck;
  const id = crypto.randomUUID();

  changeSetting(['deck'], {
    ...deck,
    layouts: [...deck.layouts, { id, name: '', columns: [] }],
  });

  toast.success(messages.deckLayoutCreated, {
    action: () => switchDeckLayout(id),
    actionLabel: messages.deckLayoutCreatedAction,
  });
};

const renameDeckLayout = (id: string, name: string) => {
  changeSetting(['deck', 'layouts'], (layouts: Array<DeckLayout>) =>
    layouts.map((layout) => (layout.id === id ? { ...layout, name } : layout)),
  );

  toast.success(messages.deckLayoutRenamed);
};

const removeDeckLayout = (id: string) => {
  const deck = useSettingsStore.getState().settings.deck;
  if (deck.layouts.length <= 1) return;

  const layouts = deck.layouts.filter((layout) => layout.id !== id);

  changeSetting(['deck'], {
    ...deck,
    layouts,
    activeLayout: deck.activeLayout === id ? layouts[0].id : deck.activeLayout,
  });

  toast.success(messages.deckLayoutDeleted);
};

export {
  getActiveLayout,
  useActiveDeckColumns,
  updateActiveLayoutColumns,
  switchDeckLayout,
  createDeckLayout,
  renameDeckLayout,
  removeDeckLayout,
};
