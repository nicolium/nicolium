import { useRouterState } from '@tanstack/react-router';
import { createContext, useContext } from 'react';
import { useIntl, type MessageDescriptor } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import { useTimelineHeading, type ITimelinePicker } from '@/components/timeline-picker';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useAccount } from '@/queries/accounts/use-account';
import { useAccountLookup } from '@/queries/accounts/use-account-lookup';
import { useBookmarkFolder } from '@/queries/statuses/use-bookmark-folders';
import { useSettings, useSettingsStore } from '@/stores/settings';

import { deckMessages as messages } from '../utils/messages';

import {
  accountRoute,
  accountByUsernameRoute,
  antennaRoute,
  bookmarksRoute,
  bubbleRoute,
  circleRoute,
  federatedRoute,
  hashtagRoute,
  homeRoute,
  instanceRoute,
  listRoute,
  localRoute,
  trendingRoute,
  wrenchedRoute,
} from './deck-routes';

import type { DeckColumn } from '@/schemas/frontend-settings';

const trendingTitles = {
  accounts: messages.trendingAccounts,
  statuses: messages.trendingStatuses,
  hashtags: messages.trendingHashtags,
  links: messages.trendingLinks,
};

const DeckColumnIdContext = createContext<string | null>(null);

const updateDeckColumn = (columnId: string, changes: Partial<DeckColumn>) => {
  const { columns } = useSettingsStore.getState().settings.deck;
  changeSetting(
    ['deck', 'columns'],
    columns.map((column) => (column.id === columnId ? { ...column, ...changes } : column)),
  );
};

const useDeckColumnConfig = <T extends DeckColumn>() => {
  const columnId = useContext(DeckColumnIdContext);
  const column = useSettings().deck.columns.find((item) => item.id === columnId) as T | undefined;

  const update = (changes: Partial<T>) => {
    if (columnId) updateDeckColumn(columnId, changes);
  };

  return [column, update] as const;
};

const useColumnTitle = (column: DeckColumn): string => {
  const intl = useIntl();
  const timelineHeading = useTimelineHeading(
    column.type === 'timeline' ? (column.timeline as any) : null,
  );
  const { data: ownAccount } = useOwnAccount();
  const { data: account } = useAccount(
    column.type === 'account' && column.accountId ? column.accountId : undefined,
  );
  const { data: bookmarkFolder } = useBookmarkFolder(
    column.type === 'bookmarks' && column.folderId !== 'all' ? column.folderId : undefined,
  );

  if (column.type === 'timeline') {
    return timelineHeading;
  }

  if (column.type === 'account') {
    const acct = column.accountId === 'self' ? ownAccount?.acct : account?.acct;
    if (acct !== undefined) return `@${acct}`;
  }

  if (column.type === 'trending') {
    switch (column.trendsType) {
      case 'accounts':
        return intl.formatMessage(messages.trendingAccounts);
      case 'statuses':
        return intl.formatMessage(messages.trendingStatuses);
      case 'hashtags':
        return intl.formatMessage(messages.trendingHashtags);
      case 'links':
        return intl.formatMessage(messages.trendingLinks);
    }
  }

  if (column.type === 'bookmarks') {
    if (column.folderId === 'all') {
      return intl.formatMessage(messages.bookmarks);
    }
    return bookmarkFolder?.name ?? intl.formatMessage(messages.bookmarks);
  }

  if (column.type === 'hashtag') {
    return `#${column.hashtag}`;
  }

  return intl.formatMessage(messages[column.type]);
};

interface RouteParams {
  username?: string;
  accountId?: string;
  listId?: string;
  circleId?: string;
  antennaId?: string;
  instance?: string;
  hashtag?: string;
  trendsType?: string;
  folderId?: string;
}

const routeTimeline = (
  routeId: string | undefined,
  params: RouteParams,
): ITimelinePicker['active'] | null => {
  switch (routeId) {
    case homeRoute.id:
      return 'home';
    case localRoute.id:
      return 'local';
    case federatedRoute.id:
      return 'federated';
    case bubbleRoute.id:
      return 'bubble';
    case wrenchedRoute.id:
      return 'wrenched';
    case listRoute.id:
      return `list:${params.listId ?? ''}`;
    case circleRoute.id:
      return `circle:${params.circleId ?? ''}`;
    case antennaRoute.id:
      return `antenna:${params.antennaId ?? ''}`;
    case instanceRoute.id:
      return `instance:${params.instance ?? ''}`;
    default:
      return null;
  }
};

const useColumnRouteTitle = () => {
  const intl = useIntl();
  const { routeId, params, staticTitle } = useRouterState({
    select: (state) => {
      const match = state.matches[state.matches.length - 1];
      return {
        routeId: match?.routeId as string | undefined,
        params: (match?.params ?? {}) as RouteParams,
        staticTitle: (match?.staticData as { title?: MessageDescriptor } | undefined)?.title,
      };
    },
  });

  const timelineHeading = useTimelineHeading(routeTimeline(routeId, params));

  const username = routeId === accountByUsernameRoute.id ? params.username : undefined;
  const { data: lookedUpAccount } = useAccountLookup(username);

  const accountId = routeId === accountRoute.id ? params.accountId : undefined;
  const { data: ownAccount } = useOwnAccount();
  const { data: account } = useAccount(accountId === 'self' ? ownAccount?.id : accountId);

  const { data: bookmarkFolder } = useBookmarkFolder(
    routeId === bookmarksRoute.id && params.folderId !== 'all' ? params.folderId : undefined,
  );

  const acct = lookedUpAccount?.acct ?? account?.acct;

  let title: string | undefined;
  if (timelineHeading) {
    title = timelineHeading;
  } else if (acct !== undefined) {
    title = `@${acct}`;
  } else if (routeId === hashtagRoute.id && params.hashtag) {
    title = `#${params.hashtag}`;
  } else if (routeId === trendingRoute.id) {
    title = intl.formatMessage(
      trendingTitles[params.trendsType as keyof typeof trendingTitles] ?? trendingTitles.hashtags,
    );
  } else if (bookmarkFolder) {
    title = bookmarkFolder.name;
  } else if (staticTitle) {
    title = intl.formatMessage(staticTitle);
  }

  return { title, accountId: lookedUpAccount?.id ?? accountId, hashtag: params.hashtag };
};

export {
  DeckColumnIdContext,
  updateDeckColumn,
  useDeckColumnConfig,
  useColumnTitle,
  useColumnRouteTitle,
};
