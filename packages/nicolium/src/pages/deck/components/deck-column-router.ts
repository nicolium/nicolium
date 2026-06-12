import { createMemoryHistory, createRouter } from '@tanstack/react-router';

import { DeckEscape, routeTree } from './deck-routes';

import type { DeckColumn } from '@/schemas/frontend-settings';

const getInitialUrl = (column: DeckColumn) => {
  switch (column.type) {
    case 'notifications':
      return '/notifications';
    case 'account':
      return `/account/${column.accountId ?? 'self'}`;
    case 'search': {
      const params = new URLSearchParams();
      if (column.query) params.set('q', column.query);
      if (column.searchType) params.set('type', column.searchType);
      const search = params.toString();
      return search ? `/search?${search}` : '/search';
    }
    case 'timeline': {
      const { timeline } = column;
      const [prefix, value] = timeline.split(':');
      switch (prefix) {
        case 'list':
        case 'circle':
        case 'antenna':
        case 'instance':
          return `/${prefix}/${value}`;
        case 'local':
        case 'federated':
        case 'bubble':
        case 'wrenched':
        case 'home':
          return `/${prefix}`;
        default:
          return '/home';
      }
    }
    case 'trending': {
      switch (column.trendsType) {
        case 'accounts':
          return '/trending/accounts';
        case 'statuses':
          return '/trending/statuses';
        case 'links':
          return '/trending/links';
        default:
          return '/trending/hashtags';
      }
    }
    case 'bookmarks': {
      if (column.folderId === 'all') {
        return '/bookmarks/all';
      }
      return `/bookmarks/${column.folderId}`;
    }
    case 'hashtag':
      return `/tags/${column.hashtag}`;
    case 'scheduled':
      return '/scheduled_statuses';
    case 'drafts':
      return '/draft_statuses';
    case 'chats':
      return '/chats';
    case 'chat':
      return `/chats/${column.chatId}`;
    default:
      return '/home';
  }
};

const columnSignature = (column: DeckColumn): string => {
  switch (column.type) {
    case 'timeline':
      return `timeline:${column.timeline}`;
    case 'notifications':
      return 'notifications';
    case 'account':
      return `account:${column.accountId ?? 'self'}`;
    case 'search':
      return 'search';
    case 'trending':
      return `trending:${column.trendsType}`;
    case 'hashtag':
      return `hashtag:${column.hashtag}`;
    case 'chats':
      return 'chats';
    case 'chat':
      return `chat:${column.chatId}`;
    default:
      return 'unknown';
  }
};

const createColumnRouter = (initialUrl: string) =>
  createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialUrl] }),
    defaultNotFoundComponent: DeckEscape,
  });

type ColumnRouter = ReturnType<typeof createColumnRouter>;

const registry = new Map<string, { router: ColumnRouter; signature: string }>();

const getDeckColumnRouter = (column: DeckColumn): ColumnRouter => {
  const signature = columnSignature(column);
  const cached = registry.get(column.id);

  if (cached && cached.signature === signature) return cached.router;

  const router = createColumnRouter(getInitialUrl(column));
  registry.set(column.id, { router, signature });
  return router;
};

const pruneDeckColumnRouters = (activeIds: Array<string>) => {
  const active = new Set(activeIds);
  for (const id of registry.keys()) {
    if (!active.has(id)) registry.delete(id);
  }
};

export { getDeckColumnRouter, pruneDeckColumnRouters, registry as deckColumnRouterRegistry };
