import iconAddressBookFill from '@phosphor-icons/core/fill/address-book-fill.svg';
import iconBellSimpleFill from '@phosphor-icons/core/fill/bell-simple-fill.svg';
import iconBookmarksFill from '@phosphor-icons/core/fill/bookmarks-fill.svg';
import iconBroadcastFill from '@phosphor-icons/core/fill/broadcast-fill.svg';
import iconCalendarDotsFill from '@phosphor-icons/core/fill/calendar-dots-fill.svg';
import iconChatsTeardropFill from '@phosphor-icons/core/fill/chats-teardrop-fill.svg';
import iconCircleFill from '@phosphor-icons/core/fill/circle-fill.svg';
import iconCirclesThreeFill from '@phosphor-icons/core/fill/circles-three-fill.svg';
import iconCloudFill from '@phosphor-icons/core/fill/cloud-fill.svg';
import iconEnvelopeSimpleFill from '@phosphor-icons/core/fill/envelope-simple-fill.svg';
import iconFediverseLogoFill from '@phosphor-icons/core/fill/fediverse-logo-fill.svg';
import iconFunnelFill from '@phosphor-icons/core/fill/funnel-fill.svg';
import iconGaugeFill from '@phosphor-icons/core/fill/gauge-fill.svg';
import iconGraphFill from '@phosphor-icons/core/fill/graph-fill.svg';
import iconHashFill from '@phosphor-icons/core/fill/hash-fill.svg';
import iconHeartHalfFill from '@phosphor-icons/core/fill/heart-half-fill.svg';
import iconHourglassFill from '@phosphor-icons/core/fill/hourglass-fill.svg';
import iconHouseFill from '@phosphor-icons/core/fill/house-fill.svg';
import iconListDashesFill from '@phosphor-icons/core/fill/list-dashes-fill.svg';
import iconMagnifyingGlassFill from '@phosphor-icons/core/fill/magnifying-glass-fill.svg';
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
import iconBellSimple from '@phosphor-icons/core/regular/bell-simple.svg';
import iconBookmarks from '@phosphor-icons/core/regular/bookmarks.svg';
import iconBroadcast from '@phosphor-icons/core/regular/broadcast.svg';
import iconCalendarDots from '@phosphor-icons/core/regular/calendar-dots.svg';
import iconChatsTeardrop from '@phosphor-icons/core/regular/chats-teardrop.svg';
import iconCircle from '@phosphor-icons/core/regular/circle.svg';
import iconCirclesThree from '@phosphor-icons/core/regular/circles-three.svg';
import iconCloud from '@phosphor-icons/core/regular/cloud.svg';
import iconEnvelopeSimple from '@phosphor-icons/core/regular/envelope-simple.svg';
import iconFediverseLogo from '@phosphor-icons/core/regular/fediverse-logo.svg';
import iconFunnel from '@phosphor-icons/core/regular/funnel.svg';
import iconGauge from '@phosphor-icons/core/regular/gauge.svg';
import iconGraph from '@phosphor-icons/core/regular/graph.svg';
import iconHash from '@phosphor-icons/core/regular/hash.svg';
import iconHeartHalf from '@phosphor-icons/core/regular/heart-half.svg';
import iconHourglass from '@phosphor-icons/core/regular/hourglass.svg';
import iconHouse from '@phosphor-icons/core/regular/house.svg';
import iconListDashes from '@phosphor-icons/core/regular/list-dashes.svg';
import iconMagnifyingGlass from '@phosphor-icons/core/regular/magnifying-glass.svg';
import iconPencilSimple from '@phosphor-icons/core/regular/pencil-simple.svg';
import iconPlanet from '@phosphor-icons/core/regular/planet.svg';
import iconProhibit from '@phosphor-icons/core/regular/prohibit.svg';
import iconRss from '@phosphor-icons/core/regular/rss.svg';
import iconSlidersHorizontal from '@phosphor-icons/core/regular/sliders-horizontal.svg';
import iconUserPlus from '@phosphor-icons/core/regular/user-plus.svg';
import iconUser from '@phosphor-icons/core/regular/user.svg';
import iconUsersThree from '@phosphor-icons/core/regular/users-three.svg';
import iconWrench from '@phosphor-icons/core/regular/wrench.svg';
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

import type { AVAILABLE_NAVIGATION_ITEMS } from '@/schemas/frontend-settings';
import type { LinkOptions } from '@tanstack/react-router';
import type { Instance } from 'pl-api';

const UNAUTHENTICATED_NAVIGATION_ITEMS = [
  'search-input',
  'home',
  'search',
  'public-timeline',
  'bubble-timeline',
  'fediverse-timeline',
  'wrenched-timeline',
];

const messages = defineMessages({
  antennas: { id: 'column.antennas', defaultMessage: 'Antennas' },
  blocks: { id: 'column.blocks', defaultMessage: 'Blocks' },
  bookmarks: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
  'bubble-timeline': { id: 'tabs_bar.bubble', defaultMessage: 'Bubble' },
  chats: { id: 'column.chats', defaultMessage: 'Chats' },
  circle: { id: 'column.circle', defaultMessage: 'Interactions circle' },
  circles: { id: 'column.circles', defaultMessage: 'Circles' },
  conversations: { id: 'column.direct', defaultMessage: 'Direct messages' },
  dashboard: { id: 'column.admin.dashboard', defaultMessage: 'Dashboard' },
  directory: { id: 'column.directory', defaultMessage: 'Profile directory' },
  'domain-blocks': { id: 'column.domain_blocks', defaultMessage: 'Domain blocks' },
  drafts: { id: 'column.draft_statuses', defaultMessage: 'Drafts' },
  drive: { id: 'column.drive', defaultMessage: 'Drive' },
  'edit-profile': { id: 'column.edit_profile', defaultMessage: 'Edit profile' },
  'fediverse-timeline': { id: 'tabs_bar.fediverse', defaultMessage: 'Fediverse' },
  filters: { id: 'column.filters', defaultMessage: 'Muted words' },
  'followed-hashtags': { id: 'column.followed_tags', defaultMessage: 'Followed hashtags' },
  'follow-requests': { id: 'column.follow_requests', defaultMessage: 'Follow requests' },
  events: { id: 'column.events', defaultMessage: 'Events' },
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
};

const NAVIGATION_ITEMS_GATE: Partial<
  Record<
    (typeof AVAILABLE_NAVIGATION_ITEMS)[number],
    (features: ReturnType<typeof useFeatures>, instance: Instance, isLoggedIn: boolean) => boolean
  >
> = {
  conversations: (features) => features.conversations,
  groups: (features) => features.groups,
  drive: (features) => features.drive,
  'public-timeline': (features, { configuration }, isLoggedIn) =>
    features.publicTimeline &&
    (isLoggedIn
      ? configuration.timelines_access.live_feeds.local !== 'disabled'
      : configuration.timelines_access.live_feeds.local === 'public'),
  'bubble-timeline': (features, { configuration }, isLoggedIn) =>
    features.publicTimeline &&
    (isLoggedIn
      ? configuration.timelines_access.live_feeds.bubble !== 'disabled'
      : configuration.timelines_access.live_feeds.bubble === 'public'),
  'fediverse-timeline': (features, { configuration }, isLoggedIn) =>
    features.publicTimeline &&
    (isLoggedIn
      ? configuration.timelines_access.live_feeds.remote !== 'disabled'
      : configuration.timelines_access.live_feeds.remote === 'public'),
  'wrenched-timeline': (features, { configuration }, isLoggedIn) =>
    features.publicTimeline &&
    (isLoggedIn
      ? configuration.timelines_access.live_feeds.wrenched !== 'disabled'
      : configuration.timelines_access.live_feeds.wrenched === 'public'),
  bookmarks: (features) => features.bookmarks,
  lists: (features) => features.lists,
  circles: (features) => features.circles,
  antennas: (features) => features.antennas,
  events: (features) => features.events,
  directory: (features) => features.profileDirectory,
  'followed-hashtags': (features) => features.followedHashtagsList,
  'rss-feed-subscriptions': (features) => features.rssFeedSubscriptions,
  filters: (features) => features.filters || features.filtersV2,
  'domain-blocks': (features) => features.federating,
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
  | ({
      type: 'profile-link';
      text: string;
      icon: string;
      activeIcon?: string;
    } & LinkOptions)
  | null;

const useNavigationItems = (pinned?: boolean) => {
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

  let filteredItems: Array<(typeof AVAILABLE_NAVIGATION_ITEMS)[number]> =
    pinned === true
      ? pinnedNavigationItems
      : pinned === false
        ? navigationItems.filter((value) => !pinnedNavigationItems.includes(value))
        : navigationItems;

  if (!account) {
    filteredItems = filteredItems.filter((item) =>
      standalone ? item === 'home' : UNAUTHENTICATED_NAVIGATION_ITEMS.includes(item),
    );
  }

  const menu: Array<NavigationItemsMenuItem> = [];

  for (const item of filteredItems) {
    switch (item) {
      case 'separator':
        menu.push(null);
        break;
      case 'search-input':
      case 'compose':
        menu.push({
          type: item,
        });
        break;
      case 'profile':
        menu.push({
          type: 'profile-link',
          to: '/@{$username}',
          params: { username: account?.acct || '' },
          text: intl.formatMessage(messages.profile),
          icon: iconUser,
          activeIcon: iconUserFill,
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
        } else if (features.conversations && !filteredItems.includes('conversations') && !pinned) {
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
        menu.push({
          type: 'link',
          to: '/scheduled_statuses',
          text: intl.formatMessage(messages['scheduled-statuses']),
          count: scheduledStatusCount,
          icon: iconHourglass,
          activeIcon: iconHourglassFill,
        });
        break;
      case 'drafts':
        menu.push({
          type: 'link',
          to: '/draft_statuses',
          text: intl.formatMessage(messages.drafts),
          count: draftCount,
          icon: iconPencilSimple,
          activeIcon: iconPencilSimpleFill,
        });
        break;
      default: {
        if (
          NAVIGATION_ITEMS_GATE[item] &&
          !NAVIGATION_ITEMS_GATE[item](features, instance, !!account)
        ) {
          break;
        }
        const { icon, activeIcon } = NAVIGATION_ITEM_ICONS[item] || {};
        menu.push({
          type: 'link',
          to: NAVIGATION_ITEM_PATHS[item],
          text: intl.formatMessage(messages[item]),
          icon,
          activeIcon,
        });
        break;
      }
    }
  }

  return menu;
};

export { useNavigationItems };
