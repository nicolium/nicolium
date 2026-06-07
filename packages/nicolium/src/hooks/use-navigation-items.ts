import iconAddressBookFill from '@phosphor-icons/core/fill/address-book-fill.svg';
import iconBalloonFill from '@phosphor-icons/core/fill/balloon-fill.svg';
import iconBellSimpleFill from '@phosphor-icons/core/fill/bell-simple-fill.svg';
import iconBookmarksFill from '@phosphor-icons/core/fill/bookmarks-fill.svg';
import iconBroadcastFill from '@phosphor-icons/core/fill/broadcast-fill.svg';
import iconCalendarDotsFill from '@phosphor-icons/core/fill/calendar-dots-fill.svg';
import iconChatsTeardropFill from '@phosphor-icons/core/fill/chats-teardrop-fill.svg';
import iconCircleFill from '@phosphor-icons/core/fill/circle-fill.svg';
import iconCirclesThreeFill from '@phosphor-icons/core/fill/circles-three-fill.svg';
import iconCloudFill from '@phosphor-icons/core/fill/cloud-fill.svg';
import iconColumnsFill from '@phosphor-icons/core/fill/columns-fill.svg';
import iconEnvelopeSimpleFill from '@phosphor-icons/core/fill/envelope-simple-fill.svg';
import iconFediverseLogoFill from '@phosphor-icons/core/fill/fediverse-logo-fill.svg';
import iconFunnelFill from '@phosphor-icons/core/fill/funnel-fill.svg';
import iconGaugeFill from '@phosphor-icons/core/fill/gauge-fill.svg';
import iconGraphFill from '@phosphor-icons/core/fill/graph-fill.svg';
import iconHashFill from '@phosphor-icons/core/fill/hash-fill.svg';
import iconHeartFill from '@phosphor-icons/core/fill/heart-fill.svg';
import iconHeartHalfFill from '@phosphor-icons/core/fill/heart-half-fill.svg';
import iconHourglassFill from '@phosphor-icons/core/fill/hourglass-fill.svg';
import iconHouseFill from '@phosphor-icons/core/fill/house-fill.svg';
import iconListDashesFill from '@phosphor-icons/core/fill/list-dashes-fill.svg';
import iconMagnifyingGlassFill from '@phosphor-icons/core/fill/magnifying-glass-fill.svg';
import iconMegaphoneFill from '@phosphor-icons/core/fill/megaphone-fill.svg';
import iconPencilSimpleFill from '@phosphor-icons/core/fill/pencil-simple-fill.svg';
import iconPlanetFill from '@phosphor-icons/core/fill/planet-fill.svg';
import iconProhibitFill from '@phosphor-icons/core/fill/prohibit-fill.svg';
import iconRssFill from '@phosphor-icons/core/fill/rss-fill.svg';
import iconSlidersHorizontalFill from '@phosphor-icons/core/fill/sliders-horizontal-fill.svg';
import iconUserFill from '@phosphor-icons/core/fill/user-fill.svg';
import iconUserPlusFill from '@phosphor-icons/core/fill/user-plus-fill.svg';
import iconUsersThreeFill from '@phosphor-icons/core/fill/users-three-fill.svg';
import iconWrenchFill from '@phosphor-icons/core/fill/wrench-fill.svg';
import iconAddressBook from '@phosphor-icons/core/regular/address-book.svg';
import iconBalloon from '@phosphor-icons/core/regular/balloon.svg';
import iconBellSimple from '@phosphor-icons/core/regular/bell-simple.svg';
import iconBookmarks from '@phosphor-icons/core/regular/bookmarks.svg';
import iconBroadcast from '@phosphor-icons/core/regular/broadcast.svg';
import iconCalendarDots from '@phosphor-icons/core/regular/calendar-dots.svg';
import iconChatsTeardrop from '@phosphor-icons/core/regular/chats-teardrop.svg';
import iconCircle from '@phosphor-icons/core/regular/circle.svg';
import iconCirclesThree from '@phosphor-icons/core/regular/circles-three.svg';
import iconCloud from '@phosphor-icons/core/regular/cloud.svg';
import iconColumns from '@phosphor-icons/core/regular/columns.svg';
import iconEnvelopeSimple from '@phosphor-icons/core/regular/envelope-simple.svg';
import iconFediverseLogo from '@phosphor-icons/core/regular/fediverse-logo.svg';
import iconFunnel from '@phosphor-icons/core/regular/funnel.svg';
import iconGauge from '@phosphor-icons/core/regular/gauge.svg';
import iconGraph from '@phosphor-icons/core/regular/graph.svg';
import iconHash from '@phosphor-icons/core/regular/hash.svg';
import iconHeartHalf from '@phosphor-icons/core/regular/heart-half.svg';
import iconHeart from '@phosphor-icons/core/regular/heart.svg';
import iconHourglass from '@phosphor-icons/core/regular/hourglass.svg';
import iconHouse from '@phosphor-icons/core/regular/house.svg';
import iconListDashes from '@phosphor-icons/core/regular/list-dashes.svg';
import iconMagnifyingGlass from '@phosphor-icons/core/regular/magnifying-glass.svg';
import iconMegaphone from '@phosphor-icons/core/regular/megaphone.svg';
import iconPencilSimple from '@phosphor-icons/core/regular/pencil-simple.svg';
import iconPlanet from '@phosphor-icons/core/regular/planet.svg';
import iconProhibit from '@phosphor-icons/core/regular/prohibit.svg';
import iconRss from '@phosphor-icons/core/regular/rss.svg';
import iconSlidersHorizontal from '@phosphor-icons/core/regular/sliders-horizontal.svg';
import iconUserPlus from '@phosphor-icons/core/regular/user-plus.svg';
import iconUser from '@phosphor-icons/core/regular/user.svg';
import iconUsersThree from '@phosphor-icons/core/regular/users-three.svg';
import iconWrench from '@phosphor-icons/core/regular/wrench.svg';
import { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useStatContext } from '@/contexts/stat-context';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useFollowRequestsCount } from '@/queries/accounts/use-follow-requests';
import { usePendingUsersCount } from '@/queries/admin/use-accounts';
import { usePendingReportsCount } from '@/queries/admin/use-reports';
import { useNotificationsUnreadCount } from '@/queries/notifications/use-notifications';
import { useScheduledStatusesCountQuery } from '@/queries/statuses/scheduled-statuses';
import { useDraftStatusesCountQuery } from '@/queries/statuses/use-draft-statuses';
import { useInteractionRequestsCount } from '@/queries/statuses/use-interaction-requests';
import { useInstance } from '@/stores/instance';
import { useSettings } from '@/stores/settings';
import { useIsStandalone } from '@/utils/state';

import type { AVAILABLE_NAVIGATION_ITEMS, NavigationItem } from '@/schemas/frontend-settings';
import type { LinkOptions } from '@tanstack/react-router';
import type { Instance } from 'pl-api';

type AvailableNavigationItem = (typeof AVAILABLE_NAVIGATION_ITEMS)[number];
type AccountNavigationItem = Extract<NavigationItem, `account:${string}`>;
type DynamicContentNavigationItem = Extract<
  NavigationItem,
  `${'list' | 'circle' | 'antenna' | 'instance' | 'hashtag' | 'bookmark_folder'}:${string}`
>;

const UNAUTHENTICATED_NAVIGATION_ITEMS = [
  'search-input',
  'home',
  'search',
  'public-timeline',
  'bubble-timeline',
  'fediverse-timeline',
  'wrenched-timeline',
] as const;

const REQUIRED_NAVIGATION_ITEMS = [
  'home',
  'search',
  'notifications',
  'chats',
  'groups',
  'profile',
  'drive',
  'settings',
  'dashboard',
  'conversations',
  'follow-requests',
  'interaction-requests',
  'bookmarks',
  'lists',
  'circles',
  'antennas',
  'events',
  'directory',
  'followed-hashtags',
  'rss-feed-subscriptions',
  'scheduled-statuses',
  'drafts',
  'compose',
] as const;

const REQUIRED_MOBILE_NAVIGATION_ITEMS = ['birthdays', 'announcements'] as const;

const messages = defineMessages({
  announcements: { id: 'announcements.title', defaultMessage: 'Announcements' },
  antennas: { id: 'column.antennas', defaultMessage: 'Antennas' },
  birthdays: { id: 'birthday_panel.title', defaultMessage: 'Birthdays' },
  blocks: { id: 'column.blocks', defaultMessage: 'Blocks' },
  bookmarks: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
  'bubble-timeline': { id: 'tabs_bar.bubble', defaultMessage: 'Bubble' },
  chats: { id: 'column.chats', defaultMessage: 'Chats' },
  circle: { id: 'column.circle', defaultMessage: 'Interactions circle' },
  circles: { id: 'column.circles', defaultMessage: 'Circles' },
  conversations: { id: 'column.direct', defaultMessage: 'Direct messages' },
  dashboard: { id: 'column.admin.dashboard', defaultMessage: 'Dashboard' },
  deck: { id: 'column.deck', defaultMessage: 'Deck' },
  directory: { id: 'column.directory', defaultMessage: 'Profile directory' },
  'domain-blocks': { id: 'column.domain_blocks', defaultMessage: 'Domain blocks' },
  drafts: { id: 'column.draft_statuses', defaultMessage: 'Drafts' },
  drive: { id: 'column.drive', defaultMessage: 'Drive' },
  'edit-profile': { id: 'column.edit_profile', defaultMessage: 'Edit profile' },
  events: { id: 'column.events', defaultMessage: 'Events' },
  favourites: { id: 'column.favourites', defaultMessage: 'Likes' },
  'fediverse-timeline': { id: 'tabs_bar.fediverse', defaultMessage: 'Fediverse' },
  filters: { id: 'column.filters', defaultMessage: 'Muted words' },
  'followed-hashtags': { id: 'column.followed_tags', defaultMessage: 'Followed hashtags' },
  'follow-requests': { id: 'column.follow_requests', defaultMessage: 'Follow requests' },
  groups: { id: 'column.groups', defaultMessage: 'Groups' },
  home: { id: 'column.home', defaultMessage: 'Home' },
  'interaction-requests': {
    id: 'column.interaction_requests',
    defaultMessage: 'Interaction requests',
  },
  lists: { id: 'column.lists', defaultMessage: 'Lists' },
  mutes: { id: 'column.mutes', defaultMessage: 'Mutes' },
  notifications: { id: 'column.notifications', defaultMessage: 'Notifications' },
  profile: { id: 'tabs_bar.profile', defaultMessage: 'Profile' },
  'public-timeline': { id: 'tabs_bar.local', defaultMessage: 'Local' },
  'scheduled-statuses': { id: 'column.scheduled_statuses', defaultMessage: 'Scheduled posts' },
  search: { id: 'column.search', defaultMessage: 'Search' },
  settings: { id: 'settings.settings', defaultMessage: 'Settings' },
  'rss-feed-subscriptions': {
    id: 'column.rss_feed_subscriptions',
    defaultMessage: 'Subscribed RSS feeds',
  },
  'wrenched-timeline': { id: 'tabs_bar.wrenched', defaultMessage: 'Wrenched' },
});

type NavigationLinkItem = keyof typeof messages;

const isAccountNavigationItem = (item: NavigationItem): item is AccountNavigationItem =>
  item.startsWith('account:');

const isDynamicContentNavigationItem = (
  item: NavigationItem,
): item is DynamicContentNavigationItem =>
  ['list', 'circle', 'antenna', 'instance', 'hashtag', 'bookmark_folder'].some((prefix) =>
    item.startsWith(`${prefix}:`),
  );

const isNavigationLinkItem = (item: AvailableNavigationItem): item is NavigationLinkItem =>
  item in messages;

const NAVIGATION_ITEM_PATHS: Record<string, LinkOptions['to']> = {
  home: '/',
  search: '/search',
  conversations: '/conversations',
  groups: '/groups',
  drive: '/drive/{-$folderId}',
  settings: '/settings',
  'public-timeline': '/timeline/local',
  'bubble-timeline': '/timeline/bubble',
  'fediverse-timeline': '/timeline/fediverse',
  'wrenched-timeline': '/timeline/wrenched',
  bookmarks: '/bookmarks',
  lists: '/lists',
  circles: '/circles',
  antennas: '/antennas',
  events: '/events',
  directory: '/directory',
  'followed-hashtags': '/followed_tags',
  'rss-feed-subscriptions': '/rss_feed_subscriptions',
  'edit-profile': '/settings/profile',
  mutes: '/mutes',
  blocks: '/blocks',
  filters: '/filters',
  'domain-blocks': '/domain_blocks',
  circle: '/circle',
  announcements: '/announcements',
  birthdays: '/birthdays',
  deck: '/deck',
};

const NAVIGATION_ITEM_ICONS: Record<string, { icon: string; activeIcon: string }> = {
  home: { icon: iconHouse, activeIcon: iconHouseFill },
  search: { icon: iconMagnifyingGlass, activeIcon: iconMagnifyingGlassFill },
  conversations: { icon: iconEnvelopeSimple, activeIcon: iconEnvelopeSimpleFill },
  groups: { icon: iconUsersThree, activeIcon: iconUsersThreeFill },
  drive: { icon: iconCloud, activeIcon: iconCloudFill },
  settings: { icon: iconSlidersHorizontal, activeIcon: iconSlidersHorizontalFill },
  'public-timeline': { icon: iconPlanet, activeIcon: iconPlanetFill },
  'bubble-timeline': { icon: iconGraph, activeIcon: iconGraphFill },
  'fediverse-timeline': { icon: iconFediverseLogo, activeIcon: iconFediverseLogoFill },
  'wrenched-timeline': { icon: iconWrench, activeIcon: iconWrenchFill },
  bookmarks: { icon: iconBookmarks, activeIcon: iconBookmarksFill },
  lists: { icon: iconListDashes, activeIcon: iconListDashesFill },
  circles: { icon: iconCirclesThree, activeIcon: iconCirclesThreeFill },
  antennas: { icon: iconBroadcast, activeIcon: iconBroadcastFill },
  events: { icon: iconCalendarDots, activeIcon: iconCalendarDotsFill },
  directory: { icon: iconAddressBook, activeIcon: iconAddressBookFill },
  'followed-hashtags': { icon: iconHash, activeIcon: iconHashFill },
  'rss-feed-subscriptions': { icon: iconRss, activeIcon: iconRssFill },
  'edit-profile': { icon: iconUser, activeIcon: iconUserFill },
  mutes: { icon: iconBellSimple, activeIcon: iconBellSimpleFill },
  blocks: { icon: iconProhibit, activeIcon: iconProhibitFill },
  filters: { icon: iconFunnel, activeIcon: iconFunnelFill },
  'domain-blocks': { icon: iconProhibit, activeIcon: iconProhibitFill },
  circle: { icon: iconCircle, activeIcon: iconCircleFill },
  announcements: { icon: iconMegaphone, activeIcon: iconMegaphoneFill },
  birthdays: { icon: iconBalloon, activeIcon: iconBalloonFill },
  deck: { icon: iconColumns, activeIcon: iconColumnsFill },
};

const NAVIGATION_ITEMS_GATE: Partial<
  Record<
    AvailableNavigationItem,
    (
      features: ReturnType<typeof useFeatures>,
      instance: Instance,
      isLoggedIn: boolean,
      isAdmin: boolean,
    ) => boolean
  >
> = {
  announcements: (features) => features.announcements,
  antennas: (features) => features.antennas,
  birthdays: (features) => features.birthdays,
  bookmarks: (features) => features.bookmarks,
  circles: (features) => features.circles,
  conversations: (features) => features.conversations,
  directory: (features) => features.profileDirectory,
  'domain-blocks': (features) => features.federating,
  drive: (features) => features.drive,
  events: (features) => features.events,
  filters: (features) => features.filters || features.filtersV2,
  'followed-hashtags': (features) => features.followedHashtagsList,
  'interaction-requests': (features) => features.interactionRequests,
  groups: (features) => features.groups,
  lists: (features) => features.lists,
  'rss-feed-subscriptions': (features) => features.rssFeedSubscriptions,
  'scheduled-statuses': (features) => features.scheduledStatuses,
  'public-timeline': (features, { configuration }, isLoggedIn, isAdmin: boolean) =>
    features.publicTimeline &&
    (isLoggedIn
      ? configuration.timelines_access.live_feeds.local !== 'disabled'
      : configuration.timelines_access.live_feeds.local === 'restricted'
        ? isAdmin
        : configuration.timelines_access.live_feeds.local === 'public'),
  'bubble-timeline': (features, { configuration }, isLoggedIn, isAdmin: boolean) =>
    features.publicTimeline &&
    features.bubbleTimeline &&
    (isLoggedIn
      ? configuration.timelines_access.live_feeds.bubble !== 'disabled'
      : configuration.timelines_access.live_feeds.bubble === 'restricted'
        ? isAdmin
        : configuration.timelines_access.live_feeds.bubble === 'public'),
  'fediverse-timeline': (features, { configuration }, isLoggedIn, isAdmin: boolean) =>
    features.publicTimeline &&
    features.federating &&
    (isLoggedIn
      ? configuration.timelines_access.live_feeds.remote !== 'disabled'
      : configuration.timelines_access.live_feeds.remote === 'restricted'
        ? isAdmin
        : configuration.timelines_access.live_feeds.remote === 'public'),
  'wrenched-timeline': (features, { configuration }, isLoggedIn, isAdmin: boolean) =>
    features.publicTimeline &&
    features.wrenchedTimeline &&
    (isLoggedIn
      ? configuration.timelines_access.live_feeds.wrenched !== 'disabled'
      : configuration.timelines_access.live_feeds.wrenched === 'restricted'
        ? isAdmin
        : configuration.timelines_access.live_feeds.wrenched === 'public'),
};

type NavigationItemsMenuItem =
  | {
      type: 'search-input' | 'compose';
    }
  | ({
      type: 'link';
      text: string;
      icon: string;
      activeIcon?: string;
      count?: number;
    } & LinkOptions)
  | {
      type: 'profile-link';
      accountId: string;
      ownAccount: boolean;
    }
  | {
      type: 'dynamic-content-link';
      contentType: DynamicContentNavigationItem extends `${infer Type}:${string}` ? Type : never;
      id: string;
    }
  | null;

const useNavigationItems = (pinned?: boolean, remaining?: boolean, mobile?: boolean) => {
  const features = useFeatures();
  const instance = useInstance();
  const intl = useIntl();
  const standalone = useIsStandalone();
  const { navigationItems, pinnedNavigationItems } = useSettings();

  const { data: account } = useOwnAccount();

  const { unreadChatsCount } = useStatContext();
  const notificationCount = useNotificationsUnreadCount();
  const followRequestsCount = useFollowRequestsCount().data ?? 0;
  const interactionRequestsCount = useInteractionRequestsCount().data ?? 0;
  const { data: awaitingApprovalCount = 0 } = usePendingUsersCount();
  const { data: pendingReportsCount = 0 } = usePendingReportsCount();
  const dashboardCount = pendingReportsCount + awaitingApprovalCount;
  const { data: scheduledStatusCount = 0 } = useScheduledStatusesCountQuery();
  const { data: draftCount = 0 } = useDraftStatusesCountQuery();

  let filteredItems = useMemo(() => {
    let filteredItems: Array<NavigationItem>;
    if (remaining === true) {
      const requiredItems = mobile
        ? [...REQUIRED_NAVIGATION_ITEMS, ...REQUIRED_MOBILE_NAVIGATION_ITEMS]
        : REQUIRED_NAVIGATION_ITEMS;
      filteredItems = requiredItems.filter((item) => {
        // Chats item falls back to conversations if chats are disabled
        if (item === 'conversations' && navigationItems.includes('chats') && !features.chats)
          return false;
        return !navigationItems.includes(item);
      });
    } else if (pinned === undefined) filteredItems = navigationItems;
    else
      filteredItems = navigationItems.filter((value) =>
        pinned ? pinnedNavigationItems.includes(value) : !pinnedNavigationItems.includes(value),
      );

    if (!account) {
      filteredItems = filteredItems.filter((item) =>
        standalone ? item === 'home' : UNAUTHENTICATED_NAVIGATION_ITEMS.includes(item as any),
      );
    }

    return filteredItems;
  }, [navigationItems, pinnedNavigationItems, pinned, remaining, !!account, instance.version]);

  return useMemo(() => {
    const menu: Array<NavigationItemsMenuItem> = [];

    for (const item of filteredItems) {
      switch (item) {
        case 'separator':
          if (menu.length === 0 || menu.at(-1) === null) break;
          menu.push(null);
          break;
        case 'search-input':
        case 'compose':
          menu.push({
            type: item,
          });
          break;
        case 'profile':
          if (!account) break;
          menu.push({
            type: 'profile-link',
            accountId: account.id,
            ownAccount: true,
          });
          break;
        case 'chats':
          if (features.chats) {
            menu.push({
              type: 'link',
              to: '/chats',
              text: intl.formatMessage(messages.chats),
              count: unreadChatsCount,
              icon: iconChatsTeardrop,
              activeIcon: iconChatsTeardropFill,
            });
          } else if (
            features.conversations &&
            !filteredItems.includes('conversations') &&
            !pinned
          ) {
            menu.push({
              type: 'link',
              to: '/conversations',
              text: intl.formatMessage(messages.conversations),
              icon: iconEnvelopeSimple,
              activeIcon: iconEnvelopeSimpleFill,
            });
          }
          break;
        case 'notifications':
          menu.push({
            type: 'link',
            to: '/notifications',
            text: intl.formatMessage(messages.notifications),
            count: notificationCount,
            icon: iconBellSimple,
            activeIcon: iconBellSimpleFill,
          });
          break;
        case 'follow-requests':
          if (account?.locked || followRequestsCount > 0) {
            menu.push({
              type: 'link',
              to: '/follow_requests',
              text: intl.formatMessage(messages['follow-requests']),
              count: followRequestsCount,
              icon: iconUserPlus,
              activeIcon: iconUserPlusFill,
            });
          }
          break;
        case 'interaction-requests':
          if (interactionRequestsCount > 0) {
            menu.push({
              type: 'link',
              to: '/interaction_requests',
              text: intl.formatMessage(messages['interaction-requests']),
              count: interactionRequestsCount,
              icon: iconHeartHalf,
              activeIcon: iconHeartHalfFill,
            });
          }
          break;
        case 'dashboard':
          if (account && (account.is_admin ?? account.is_moderator)) {
            menu.push({
              type: 'link',
              to: '/nicolium/admin',
              text: intl.formatMessage(messages.dashboard),
              count: dashboardCount,
              icon: iconGauge,
              activeIcon: iconGaugeFill,
            });
          }
          break;
        case 'scheduled-statuses':
          if (scheduledStatusCount > 0) {
            menu.push({
              type: 'link',
              to: '/scheduled_statuses',
              text: intl.formatMessage(messages['scheduled-statuses']),
              count: scheduledStatusCount,
              icon: iconHourglass,
              activeIcon: iconHourglassFill,
            });
          }
          break;
        case 'drafts':
          if (draftCount > 0) {
            menu.push({
              type: 'link',
              to: '/draft_statuses',
              text: intl.formatMessage(messages.drafts),
              count: draftCount,
              icon: iconPencilSimple,
              activeIcon: iconPencilSimpleFill,
            });
          }
          break;
        case 'favourites':
          if (!account) break;
          menu.push({
            type: 'link',
            to: '/@{$username}/favorites',
            params: { username: account?.acct },
            text: intl.formatMessage(messages.favourites),
            icon: iconHeart,
            activeIcon: iconHeartFill,
          });
          break;
        default: {
          if (isAccountNavigationItem(item)) {
            menu.push({
              type: 'profile-link',
              accountId: item.slice(8),
              ownAccount: false,
            });
            break;
          }

          if (isDynamicContentNavigationItem(item)) {
            const [contentType, id] = item.split(':', 2) as [
              Extract<NavigationItemsMenuItem, { type: 'dynamic-content-link' }>['contentType'],
              string,
            ];
            menu.push({ type: 'dynamic-content-link', contentType, id });
            break;
          }

          const fixedItem: AvailableNavigationItem = item;

          if (
            NAVIGATION_ITEMS_GATE[fixedItem] &&
            !NAVIGATION_ITEMS_GATE[fixedItem](
              features,
              instance,
              !!account,
              !!(account?.is_admin || account?.is_moderator),
            )
          ) {
            break;
          }

          if (!isNavigationLinkItem(fixedItem)) break;

          const { icon, activeIcon } = NAVIGATION_ITEM_ICONS[fixedItem] || {};
          menu.push({
            type: 'link',
            to: NAVIGATION_ITEM_PATHS[fixedItem],
            text: intl.formatMessage(messages[fixedItem]),
            icon,
            activeIcon,
          });
          break;
        }
      }
    }

    return menu;
  }, [
    filteredItems,
    instance.version,
    !!account,
    intl,
    unreadChatsCount,
    notificationCount,
    followRequestsCount,
    interactionRequestsCount,
    dashboardCount,
    scheduledStatusCount,
    draftCount,
  ]);
};

export { useNavigationItems, NAVIGATION_ITEMS_GATE, type NavigationItemsMenuItem };
