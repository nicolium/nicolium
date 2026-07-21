import { createContext } from 'react';

import type { AnyRouter } from '@tanstack/react-router';

const DeckColumnIdContext = createContext<string | null>(null);

interface DeckColumnRouterEntry {
  router: AnyRouter;
  signature: string;
}

const deckColumnRouterRegistry = new Map<string, DeckColumnRouterEntry>();

export { DeckColumnIdContext, deckColumnRouterRegistry, type DeckColumnRouterEntry };
