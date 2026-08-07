import { useCallback } from 'react';

import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useInstance } from '@/stores/instance';

import type { DeckColumn } from '@/schemas/frontend-settings';
import type { Features, Instance } from 'pl-api';

type Timeline = Extract<DeckColumn, { type: 'timeline' }>['timeline'];
type TrendsType = Extract<DeckColumn, { type: 'trending' }>['trendsType'];

interface DeckColumnPartial {
  type: DeckColumn['type'];
  timeline?: Timeline;
  trendsType?: TrendsType;
}

const canAccessLiveFeed = (
  access: 'authenticated' | 'disabled' | 'public' | 'restricted',
  isAdmin: boolean,
) => (access === 'restricted' ? isAdmin : access !== 'disabled');

const isDeckColumnAvailable = (
  column: DeckColumnPartial,
  features: Features,
  timelineAccess: Instance['configuration']['timelines_access'],
  isAdmin: boolean,
): boolean => {
  if (column.type === 'timeline') {
    switch (column.timeline) {
      case 'local':
        return (
          features.publicTimeline && canAccessLiveFeed(timelineAccess.live_feeds.local, isAdmin)
        );
      case 'bubble':
        return (
          features.bubbleTimeline && canAccessLiveFeed(timelineAccess.live_feeds.bubble, isAdmin)
        );
      case 'federated':
        return (
          features.publicTimeline && canAccessLiveFeed(timelineAccess.live_feeds.remote, isAdmin)
        );
      case 'wrenched':
        return (
          features.wrenchedTimeline &&
          canAccessLiveFeed(timelineAccess.live_feeds.wrenched, isAdmin)
        );
    }
  }

  switch (column.type) {
    case 'bookmarks':
      return features.bookmarks;
    case 'chat':
    case 'chats':
      return features.chats;
    case 'interaction-requests':
      return features.interactionRequests;
    case 'drive':
      return features.drive;
    case 'scheduled':
      return features.scheduledStatuses;
    case 'trending':
      switch (column.trendsType) {
        case 'accounts':
          return features.suggestions || features.suggestionsV2;
        case 'statuses':
          return features.trendingStatuses;
        case 'hashtags':
          return features.trends;
        case 'links':
          return features.trendingLinks;
        default:
          return false;
      }
    default:
      return true;
  }
};

const useDeckColumnAvailable = () => {
  const features = useFeatures();
  const timelineAccess = useInstance().configuration.timelines_access;
  const { data: account } = useOwnAccount();
  const isAdmin = !!(account?.is_admin || account?.is_moderator);

  return useCallback(
    (column: DeckColumnPartial) => isDeckColumnAvailable(column, features, timelineAccess, isAdmin),
    [features, timelineAccess, isAdmin],
  );
};

export { useDeckColumnAvailable };
