import iconChatTeardrop from '@phosphor-icons/core/regular/chat-teardrop.svg';
import iconChatsTeardrop from '@phosphor-icons/core/regular/chats-teardrop.svg';
import iconCloud from '@phosphor-icons/core/regular/cloud.svg';
import iconGraph from '@phosphor-icons/core/regular/graph.svg';
import iconHourglass from '@phosphor-icons/core/regular/hourglass.svg';
import iconPencilSimple from '@phosphor-icons/core/regular/pencil-simple.svg';
import { useRouterState } from '@tanstack/react-router';
import { createContext, useContext } from 'react';
import { useIntl, type MessageDescriptor } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import { useTimelineHeading, type ITimelinePicker } from '@/components/timeline-picker';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useAccount } from '@/queries/accounts/use-account';
import { useAccountLookup } from '@/queries/accounts/use-account-lookup';
import { useAntenna } from '@/queries/accounts/use-antennas';
import { useCircle } from '@/queries/accounts/use-circles';
import { useList } from '@/queries/accounts/use-lists';
import { useChat } from '@/queries/chats';
import { useDriveFolderQuery } from '@/queries/drive/use-drive-folder';
import { useBookmarkFolder } from '@/queries/statuses/use-bookmark-folders';
import { useSettings, useSettingsStore } from '@/stores/settings';

import { deckMessages as messages } from '../utils/messages';

import {
  accountRoute,
  accountByUsernameRoute,
  antennaRoute,
  bookmarksRoute,
  bubbleRoute,
  chatRoute,
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

// only ones without specialized handling in DeckColumnHeader
const useColumnTitle = (column: DeckColumn): string => {
  const intl = useIntl();
  const { data: chat } = useChat(column.type === 'chat' ? column.chatId : undefined);
  const { data: folder } = useDriveFolderQuery(
    column.type === 'drive' ? column.folderId : undefined,
  );

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

  if (column.type === 'chat') {
    return intl.formatMessage(messages.chatWith, { acct: chat?.account.acct ?? column.chatId });
  }

  if (column.type === 'drive' && column.folderId) {
    return folder?.name ?? intl.formatMessage(messages.drive);
  }

  return intl.formatMessage(messages[column.type]);
};

const useColumnIcon = (column: DeckColumn) => {
  switch (column.type) {
    case 'chats':
      return iconChatsTeardrop;
    case 'chat':
      return iconChatTeardrop;
    case 'drive':
      return iconCloud;
    case 'trending':
      return iconGraph;
    case 'scheduled':
      return iconHourglass;
    case 'drafts':
      return iconPencilSimple;
    default:
      return '';
  }
};

type DeckColumnResource =
  | 'list'
  | 'circle'
  | 'antenna'
  | 'account'
  | 'chat'
  | 'bookmarks'
  | 'drive';

const getResponseStatus = (error: unknown) =>
  (error as { response?: { status?: number } } | null)?.response?.status;

const useColumnNotFound = (column: DeckColumn): DeckColumnResource | null => {
  const [timelineType, timelineValue] =
    column.type === 'timeline' ? column.timeline.split(':') : [];

  const list = useList(timelineType === 'list' ? timelineValue : undefined);
  const circle = useCircle(timelineType === 'circle' ? timelineValue : undefined);
  const antenna = useAntenna(timelineType === 'antenna' ? timelineValue : undefined);
  const account = useAccount(
    column.type === 'account' && column.accountId && column.accountId !== 'self'
      ? column.accountId
      : undefined,
  );
  const chat = useChat(column.type === 'chat' ? column.chatId : undefined);
  const bookmarkFolder = useBookmarkFolder(
    column.type === 'bookmarks' && column.folderId !== 'all' ? column.folderId : undefined,
  );

  if (timelineType === 'list') return list.isSuccess && !list.data ? 'list' : null;
  if (timelineType === 'circle') return circle.isSuccess && !circle.data ? 'circle' : null;
  if (timelineType === 'antenna') return antenna.isSuccess && !antenna.data ? 'antenna' : null;
  if (column.type === 'bookmarks' && column.folderId !== 'all')
    return bookmarkFolder.isSuccess && !bookmarkFolder.data ? 'bookmarks' : null;
  if (column.type === 'account') return getResponseStatus(account.error) === 404 ? 'account' : null;
  if (column.type === 'chat') return getResponseStatus(chat.error) === 404 ? 'chat' : null;

  return null;
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
  chatId?: string;
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

  const chatId = routeId === chatRoute.id ? params.chatId : undefined;
  const { data: chat } = useChat(chatId);

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
  } else if (routeId === chatRoute.id && chat) {
    title = intl.formatMessage(messages.chatWith, { acct: chat.account.acct });
  } else if (staticTitle) {
    title = intl.formatMessage(staticTitle);
  }

  return {
    title,
    accountId: lookedUpAccount?.id ?? accountId ?? chat?.account?.id,
    hashtag: params.hashtag,
    chatId: params.chatId,
    folderId: params.folderId,
  };
};

export {
  DeckColumnIdContext,
  updateDeckColumn,
  useDeckColumnConfig,
  useColumnTitle,
  useColumnIcon,
  useColumnNotFound,
  useColumnRouteTitle,
  useTimelineHeading,
};

export type { DeckColumnResource };
