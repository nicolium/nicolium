import { createContext, useContext } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import { useTimelineHeading } from '@/components/timeline-picker';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useAccount } from '@/queries/accounts/use-account';
import { useBookmarkFolder } from '@/queries/statuses/use-bookmark-folders';
import { useSettings, useSettingsStore } from '@/stores/settings';

import type { DeckColumn } from '@/schemas/frontend-settings';

const messages = defineMessages({
  searchPlaceholder: { id: 'search.placeholder', defaultMessage: 'Search' },
  home: { id: 'column.home', defaultMessage: 'Home' },
  local: { id: 'column.community', defaultMessage: 'Local timeline' },
  federated: { id: 'column.public', defaultMessage: 'Fediverse timeline' },
  bubble: { id: 'column.bubble', defaultMessage: 'Bubble timeline' },
  wrenched: { id: 'column.wrenched', defaultMessage: 'Wrenched timeline' },
  timeline: { id: 'column.deck.timeline', defaultMessage: 'Timeline' },
  notifications: { id: 'column.notifications', defaultMessage: 'Notifications' },
  account: { id: 'column.account', defaultMessage: 'Profile' },
  search: { id: 'column.search', defaultMessage: 'Search' },
  status: { id: 'column.status', defaultMessage: 'Post' },
  hashtag: { id: 'column.hashtag', defaultMessage: 'Hashtag' },
  remove: { id: 'column.deck.remove', defaultMessage: 'Remove column' },
  shrink: { id: 'column.deck.width.shrink', defaultMessage: 'Shrink column' },
  widen: { id: 'column.deck.width.widen', defaultMessage: 'Widen column' },
  fill: { id: 'column.deck.width.fill', defaultMessage: 'Fill available width' },
  moveLeft: { id: 'column.deck.position.left', defaultMessage: 'Move column left' },
  moveRight: { id: 'column.deck.position.right', defaultMessage: 'Move column right' },
  showReplies: { id: 'timeline_filters.show_replies', defaultMessage: 'Show replies' },
  showPinned: { id: 'column.deck.account.show_pinned', defaultMessage: 'Show pinned posts' },
  addColumn: {
    id: 'column.deck.add_column',
    defaultMessage: 'Add column to deck',
  },
  trendingAccounts: { id: 'deck.columns.trending_accounts', defaultMessage: 'Suggested accounts' },
  trendingStatuses: { id: 'deck.columns.trending_statuses', defaultMessage: 'Trending statuses' },
  trendingHashtags: { id: 'deck.columns.trending_hashtags', defaultMessage: 'Trending hashtags' },
  trendingLinks: { id: 'deck.columns.trending_links', defaultMessage: 'Trending links' },
  bookmarks: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
  scheduled: { id: 'column.scheduled_statuses', defaultMessage: 'Scheduled posts' },
  drafts: { id: 'column.draft_statuses', defaultMessage: 'Drafts' },
  chats: { id: 'column.chats', defaultMessage: 'Chats' },
  chat: { id: 'column.chats', defaultMessage: 'Chats' },
});

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

export {
  messages as deckMessages,
  DeckColumnIdContext,
  updateDeckColumn,
  useDeckColumnConfig,
  useColumnTitle,
};
