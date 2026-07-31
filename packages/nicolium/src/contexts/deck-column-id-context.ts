import { createContext, useContext } from 'react';

import type { AnyRouter } from '@tanstack/react-router';

const DeckColumnIdContext = createContext<string | null>(null);

interface DeckColumnRouterEntry {
  router: AnyRouter;
  signature: string;
}

const deckColumnRouterRegistry = new Map<string, DeckColumnRouterEntry>();

const useColumnId = () => useContext(DeckColumnIdContext) || undefined;

export { DeckColumnIdContext, deckColumnRouterRegistry, useColumnId, type DeckColumnRouterEntry };
