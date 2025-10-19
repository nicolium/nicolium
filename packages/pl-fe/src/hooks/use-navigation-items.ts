import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import { useStatContext } from 'pl-fe/contexts/stat-context';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import { useFollowRequestsCount } from 'pl-fe/queries/accounts/use-follow-requests';
import { useInteractionRequestsCount } from 'pl-fe/queries/statuses/use-interaction-requests';
import { NAVIGATION_ICONS, navigationMessages, type NavigationItemId } from 'pl-fe/utils/navigation';

import type { MenuItem } from 'pl-fe/components/dropdown-menu';

export interface NavigationItem {
  id: NavigationItemId;
  /** Navigation route */
  to: string;
  /** Label text */
  text: string;
  /** Icon source */
  icon: string;
  /** Active (filled) icon source */
  activeIcon?: string;
  /** Badge count */
  count?: number;
  /** Whether this item should be shown */
  show: boolean;
}

interface UseNavigationItemsOptions {
  /** Include scheduled/draft status counts (requires additional queries) */
  includeStatusCounts?: boolean;
  /** Include dashboard counts (requires admin queries) */
  includeDashboardCount?: boolean;
}

/**
 * Custom hook to build navigation items based on account, features, and permissions
 * Centralizes the logic for determining which navigation items are available
 */
export const useNavigationItems = (options: UseNavigationItemsOptions = {}) => {
  const intl = useIntl();
  const { account } = useOwnAccount();
  const features = useFeatures();
  const instance = useInstance();
  const { unreadChatsCount } = useStatContext();

  const notificationCount = useAppSelector((state) => state.notifications.unread);
  const followRequestsCount = useFollowRequestsCount().data || 0;
  const interactionRequestsCount = useInteractionRequestsCount().data || 0;

  const restrictUnauth = instance.pleroma.metadata.restrict_unauthenticated;

  // Build all available navigation items
  const allItems = useMemo((): NavigationItem[] => {
    const items: NavigationItem[] = [];

    // Always available items
    items.push({
      id: 'home',
      to: '/',
      text: intl.formatMessage(navigationMessages.home),
      icon: NAVIGATION_ICONS.home.src,
      activeIcon: NAVIGATION_ICONS.home.activeSrc,
      show: true,
    });

    items.push({
      id: 'search',
      to: '/search',
      text: intl.formatMessage(navigationMessages.search),
      icon: NAVIGATION_ICONS.search.src,
      activeIcon: NAVIGATION_ICONS.search.activeSrc,
      show: true,
    });

    // Authenticated user items
    if (account) {
      items.push({
        id: 'notifications',
        to: '/notifications',
        text: intl.formatMessage(navigationMessages.notifications),
        icon: NAVIGATION_ICONS.notifications.src,
        activeIcon: NAVIGATION_ICONS.notifications.activeSrc,
        count: notificationCount,
        show: true,
      });

      if (features.chats) {
        items.push({
          id: 'chats',
          to: '/chats',
          text: intl.formatMessage(navigationMessages.chats),
          icon: NAVIGATION_ICONS.chats.src,
          activeIcon: NAVIGATION_ICONS.chats.activeSrc,
          count: unreadChatsCount,
          show: true,
        });
      }

      if (!features.chats && features.conversations) {
        items.push({
          id: 'conversations',
          to: '/conversations',
          text: intl.formatMessage(navigationMessages.conversations),
          icon: NAVIGATION_ICONS.conversations.src,
          activeIcon: NAVIGATION_ICONS.conversations.activeSrc,
          show: true,
        });
      }

      if (features.groups) {
        items.push({
          id: 'groups',
          to: '/groups',
          text: intl.formatMessage(navigationMessages.groups),
          icon: NAVIGATION_ICONS.groups.src,
          activeIcon: NAVIGATION_ICONS.groups.activeSrc,
          show: true,
        });
      }

      items.push({
        id: 'profile',
        to: `/@${account.acct}`,
        text: intl.formatMessage(navigationMessages.profile),
        icon: NAVIGATION_ICONS.profile.src,
        activeIcon: NAVIGATION_ICONS.profile.activeSrc,
        show: true,
      });

      items.push({
        id: 'settings',
        to: '/settings',
        text: intl.formatMessage(navigationMessages.settings),
        icon: NAVIGATION_ICONS.settings.src,
        activeIcon: NAVIGATION_ICONS.settings.activeSrc,
        show: true,
      });

      if (account.locked || followRequestsCount > 0) {
        items.push({
          id: 'follow_requests',
          to: '/follow_requests',
          text: intl.formatMessage(navigationMessages.followRequests),
          icon: NAVIGATION_ICONS.follow_requests.src,
          count: followRequestsCount,
          show: true,
        });
      }

      if (interactionRequestsCount > 0) {
        items.push({
          id: 'interaction_requests',
          to: '/interaction_requests',
          text: intl.formatMessage(navigationMessages.interactionRequests),
          icon: NAVIGATION_ICONS.interaction_requests.src,
          count: interactionRequestsCount,
          show: true,
        });
      }

      if (features.bookmarks) {
        items.push({
          id: 'bookmarks',
          to: '/bookmarks',
          text: intl.formatMessage(navigationMessages.bookmarks),
          icon: NAVIGATION_ICONS.bookmarks.src,
          show: true,
        });
      }

      if (features.lists) {
        items.push({
          id: 'lists',
          to: '/lists',
          text: intl.formatMessage(navigationMessages.lists),
          icon: NAVIGATION_ICONS.lists.src,
          show: true,
        });
      }

      if (features.circles) {
        items.push({
          id: 'circles',
          to: '/circles',
          text: intl.formatMessage(navigationMessages.circles),
          icon: NAVIGATION_ICONS.circles.src,
          show: true,
        });
      }

      if (features.events) {
        items.push({
          id: 'events',
          to: '/events',
          text: intl.formatMessage(navigationMessages.events),
          icon: NAVIGATION_ICONS.events.src,
          show: true,
        });
      }

      if (features.profileDirectory) {
        items.push({
          id: 'directory',
          to: '/directory',
          text: intl.formatMessage(navigationMessages.profileDirectory),
          icon: NAVIGATION_ICONS.directory.src,
          show: true,
        });
      }

      if (features.followedHashtagsList) {
        items.push({
          id: 'followed_tags',
          to: '/followed_tags',
          text: intl.formatMessage(navigationMessages.followedTags),
          icon: NAVIGATION_ICONS.followed_tags.src,
          show: true,
        });
      }
    }

    // Public timeline items
    if (features.publicTimeline) {
      if (features.wrenchedTimeline && (account || !restrictUnauth.timelines.wrenched)) {
        items.push({
          id: 'wrenched',
          to: '/timeline/wrenched',
          text: intl.formatMessage(navigationMessages.wrenched),
          icon: NAVIGATION_ICONS.wrenched.src,
          activeIcon: NAVIGATION_ICONS.wrenched.activeSrc,
          show: true,
        });
      }

      if (account || !restrictUnauth.timelines.local) {
        items.push({
          id: 'local',
          to: '/timeline/local',
          text: features.federating
            ? intl.formatMessage(navigationMessages.local)
            : intl.formatMessage(navigationMessages.all),
          icon: NAVIGATION_ICONS.local.src,
          activeIcon: NAVIGATION_ICONS.local.activeSrc,
          show: true,
        });
      }

      if (features.bubbleTimeline && (account || !restrictUnauth.timelines.bubble)) {
        items.push({
          id: 'bubble',
          to: '/timeline/bubble',
          text: intl.formatMessage(navigationMessages.bubble),
          icon: NAVIGATION_ICONS.bubble.src,
          activeIcon: NAVIGATION_ICONS.bubble.activeSrc,
          show: true,
        });
      }

      if (features.federating && (account || !restrictUnauth.timelines.federated)) {
        items.push({
          id: 'fediverse',
          to: '/timeline/fediverse',
          text: intl.formatMessage(navigationMessages.fediverse),
          icon: NAVIGATION_ICONS.fediverse.src,
          activeIcon: NAVIGATION_ICONS.fediverse.activeSrc,
          show: true,
        });
      }
    }

    return items;
  }, [
    account?.acct,
    account?.locked,
    features.chats,
    features.conversations,
    features.groups,
    features.bookmarks,
    features.lists,
    features.circles,
    features.events,
    features.profileDirectory,
    features.followedHashtagsList,
    features.publicTimeline,
    features.wrenchedTimeline,
    features.bubbleTimeline,
    features.federating,
    notificationCount,
    unreadChatsCount,
    followRequestsCount,
    interactionRequestsCount,
    restrictUnauth.timelines.wrenched,
    restrictUnauth.timelines.local,
    restrictUnauth.timelines.bubble,
    restrictUnauth.timelines.federated,
    intl,
  ]);

  return {
    /** All available navigation items */
    items: allItems,
    /** Get item by ID */
    getItem: (id: NavigationItemId) => allItems.find(item => item.id === id),
    /** Get items by IDs */
    getItems: (ids: NavigationItemId[]) =>
      ids.map(id => allItems.find(item => item.id === id)).filter((item): item is NavigationItem => !!item),
  };
};

/**
 * Hook to build navigation items for dropdown menu with dashboard/status counts
 * This is a specialized version that includes additional counts
 */
export const useNavigationItemsWithCounts = (
  scheduledStatusCount: number = 0,
  draftCount: number = 0,
  dashboardCount: number = 0,
) => {
  const { items: baseItems, ...rest } = useNavigationItems();
  const intl = useIntl();
  const { account } = useOwnAccount();

  const itemsWithCounts = useMemo((): NavigationItem[] => {
    const items = [...baseItems];

    if (!account) return items;

    // Add dashboard for admins/moderators
    if (account.is_admin || account.is_moderator) {
      items.push({
        id: 'dashboard',
        to: '/pl-fe/admin',
        text: intl.formatMessage(navigationMessages.dashboard),
        icon: NAVIGATION_ICONS.dashboard.src,
        activeIcon: NAVIGATION_ICONS.dashboard.activeSrc,
        count: dashboardCount,
        show: true,
      });
    }

    // Add scheduled statuses if count > 0
    if (scheduledStatusCount > 0) {
      items.push({
        id: 'scheduled_statuses',
        to: '/scheduled_statuses',
        text: intl.formatMessage(navigationMessages.scheduledStatuses),
        icon: NAVIGATION_ICONS.scheduled_statuses.src,
        count: scheduledStatusCount,
        show: true,
      });
    }

    // Add drafts if count > 0
    if (draftCount > 0) {
      items.push({
        id: 'draft_statuses',
        to: '/draft_statuses',
        text: intl.formatMessage(navigationMessages.drafts),
        icon: NAVIGATION_ICONS.draft_statuses.src,
        count: draftCount,
        show: true,
      });
    }

    return items;
  }, [baseItems, account?.is_admin, account?.is_moderator, scheduledStatusCount, draftCount, dashboardCount, intl]);

  return {
    items: itemsWithCounts,
    ...rest,
  };
};

/**
 * Convert NavigationItem to MenuItem format for dropdown menus
 */
export const navigationItemToMenuItem = (item: NavigationItem): MenuItem => ({
  to: item.to,
  text: item.text,
  icon: item.icon,
  count: item.count,
});
