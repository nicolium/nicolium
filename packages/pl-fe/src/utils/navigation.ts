/**
 * Shared utilities for navigation components
 */

import { defineMessages } from 'react-intl';

/** Shared i18n messages for navigation items */
export const navigationMessages = defineMessages({
  home: { id: 'navigation.home', defaultMessage: 'Home' },
  search: { id: 'navigation.search', defaultMessage: 'Search' },
  notifications: { id: 'navigation.notifications', defaultMessage: 'Notifications' },
  chats: { id: 'navigation.chats', defaultMessage: 'Chats' },
  groups: { id: 'tabs_bar.groups', defaultMessage: 'Groups' },
  profile: { id: 'tabs_bar.profile', defaultMessage: 'Profile' },
  settings: { id: 'tabs_bar.settings', defaultMessage: 'Settings' },
  dashboard: { id: 'tabs_bar.dashboard', defaultMessage: 'Dashboard' },
  wrenched: { id: 'tabs_bar.wrenched', defaultMessage: 'Wrenched' },
  local: { id: 'tabs_bar.local', defaultMessage: 'Local' },
  all: { id: 'tabs_bar.all', defaultMessage: 'All' },
  bubble: { id: 'tabs_bar.bubble', defaultMessage: 'Bubble' },
  fediverse: { id: 'tabs_bar.fediverse', defaultMessage: 'Fediverse' },
  followRequests: { id: 'navigation_bar.follow_requests', defaultMessage: 'Follow requests' },
  bookmarks: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
  lists: { id: 'column.lists', defaultMessage: 'Lists' },
  circles: { id: 'column.circles', defaultMessage: 'Circles' },
  events: { id: 'column.events', defaultMessage: 'Events' },
  profileDirectory: { id: 'navigation_bar.profile_directory', defaultMessage: 'Profile directory' },
  followedTags: { id: 'navigation_bar.followed_tags', defaultMessage: 'Followed hashtags' },
  scheduledStatuses: { id: 'column.scheduled_statuses', defaultMessage: 'Scheduled posts' },
  drafts: { id: 'navigation.drafts', defaultMessage: 'Drafts' },
  conversations: { id: 'navigation.direct_messages', defaultMessage: 'Direct messages' },
  interactionRequests: { id: 'navigation.interaction_requests', defaultMessage: 'Interaction requests' },
  help: { id: 'navigation.help', defaultMessage: 'Help' },
  keyboardShortcuts: { id: 'navigation.keyboard_shortcuts', defaultMessage: 'Keyboard shortcuts' },
  sourceCode: { id: 'navigation.source_code', defaultMessage: 'Source code' },
  compose: { id: 'navigation.compose', defaultMessage: 'Compose' },
  openSidebar: { id: 'navigation.sidebar', defaultMessage: 'Open sidebar' },
  closeSidebar: { id: 'navigation.sidebar.close', defaultMessage: 'Close sidebar' },
});

export type NavigationItemId =
  | 'home'
  | 'search'
  | 'notifications'
  | 'chats'
  | 'conversations'
  | 'groups'
  | 'profile'
  | 'settings'
  | 'dashboard'
  | 'wrenched'
  | 'local'
  | 'bubble'
  | 'fediverse'
  | 'follow_requests'
  | 'interaction_requests'
  | 'bookmarks'
  | 'lists'
  | 'circles'
  | 'events'
  | 'directory'
  | 'followed_tags'
  | 'scheduled_statuses'
  | 'draft_statuses';

export interface NavigationIcon {
  /** Regular icon source */
  src: string;
  /** Active (filled) icon source */
  activeSrc?: string;
}

/** Icon mappings for all navigation items */
export const NAVIGATION_ICONS: Record<NavigationItemId, NavigationIcon> = {
  home: {
    src: require('@phosphor-icons/core/regular/house.svg'),
    activeSrc: require('@phosphor-icons/core/fill/house-fill.svg'),
  },
  search: {
    src: require('@phosphor-icons/core/regular/magnifying-glass.svg'),
    activeSrc: require('@phosphor-icons/core/fill/magnifying-glass-fill.svg'),
  },
  notifications: {
    src: require('@phosphor-icons/core/regular/bell-simple.svg'),
    activeSrc: require('@phosphor-icons/core/fill/bell-simple-fill.svg'),
  },
  chats: {
    src: require('@phosphor-icons/core/regular/chats-teardrop.svg'),
    activeSrc: require('@phosphor-icons/core/fill/chats-teardrop-fill.svg'),
  },
  conversations: {
    src: require('@phosphor-icons/core/regular/envelope-simple.svg'),
    activeSrc: require('@phosphor-icons/core/fill/envelope-simple-fill.svg'),
  },
  groups: {
    src: require('@phosphor-icons/core/regular/users-three.svg'),
    activeSrc: require('@phosphor-icons/core/fill/users-three-fill.svg'),
  },
  profile: {
    src: require('@phosphor-icons/core/regular/user.svg'),
    activeSrc: require('@phosphor-icons/core/fill/user-fill.svg'),
  },
  settings: {
    src: require('@phosphor-icons/core/regular/sliders-horizontal.svg'),
    activeSrc: require('@phosphor-icons/core/fill/sliders-horizontal-fill.svg'),
  },
  dashboard: {
    src: require('@phosphor-icons/core/regular/gauge.svg'),
    activeSrc: require('@phosphor-icons/core/fill/gauge-fill.svg'),
  },
  wrenched: {
    src: require('@phosphor-icons/core/regular/wrench.svg'),
    activeSrc: require('@phosphor-icons/core/fill/wrench-fill.svg'),
  },
  local: {
    src: require('@phosphor-icons/core/regular/planet.svg'),
    activeSrc: require('@phosphor-icons/core/fill/planet-fill.svg'),
  },
  bubble: {
    src: require('@phosphor-icons/core/regular/graph.svg'),
    activeSrc: require('@phosphor-icons/core/fill/graph-fill.svg'),
  },
  fediverse: {
    src: require('@phosphor-icons/core/regular/fediverse-logo.svg'),
    activeSrc: require('@phosphor-icons/core/fill/fediverse-logo-fill.svg'),
  },
  follow_requests: {
    src: require('@phosphor-icons/core/regular/user-plus.svg'),
  },
  interaction_requests: {
    src: require('@phosphor-icons/core/regular/heart-half.svg'),
  },
  bookmarks: {
    src: require('@phosphor-icons/core/regular/bookmarks.svg'),
  },
  lists: {
    src: require('@phosphor-icons/core/regular/list-dashes.svg'),
  },
  circles: {
    src: require('@phosphor-icons/core/regular/circles-three.svg'),
  },
  events: {
    src: require('@phosphor-icons/core/regular/calendar-dots.svg'),
  },
  directory: {
    src: require('@phosphor-icons/core/regular/address-book.svg'),
  },
  followed_tags: {
    src: require('@phosphor-icons/core/regular/hash.svg'),
  },
  scheduled_statuses: {
    src: require('@phosphor-icons/core/regular/hourglass.svg'),
  },
  draft_statuses: {
    src: require('@phosphor-icons/core/regular/pencil-simple.svg'),
  },
};

export interface NavigationItemConfig {
  id: string;
  pinned: boolean;
}

/** Default navigation items configuration (matches schema defaults) */
export const DEFAULT_NAVIGATION_ITEMS: NavigationItemConfig[] = [
  { id: 'home', pinned: true },
  { id: 'search', pinned: true },
  { id: 'notifications', pinned: true },
  { id: 'chats', pinned: true },
  { id: 'groups', pinned: true },
  { id: 'profile', pinned: true },
  { id: 'settings', pinned: true },
  { id: 'dashboard', pinned: true },
  { id: 'local', pinned: true },
  { id: 'fediverse', pinned: true },
  { id: 'conversations', pinned: false },
  { id: 'follow_requests', pinned: false },
  { id: 'interaction_requests', pinned: false },
  { id: 'bookmarks', pinned: false },
  { id: 'lists', pinned: false },
  { id: 'circles', pinned: false },
  { id: 'events', pinned: false },
  { id: 'wrenched', pinned: false },
  { id: 'bubble', pinned: false },
  { id: 'directory', pinned: false },
  { id: 'followed_tags', pinned: false },
  { id: 'scheduled_statuses', pinned: false },
  { id: 'draft_statuses', pinned: false },
];

/**
 * Filters navigation items to only return pinned ones
 * Returns default pinned items if input is invalid/empty
 */
export const getPinnedNavigationItems = (
  items: Array<{ id: string; pinned: boolean }> | undefined,
): NavigationItemConfig[] => {
  if (!items || items.length === 0) {
    return DEFAULT_NAVIGATION_ITEMS.filter(item => item.pinned);
  }
  return items.filter(item => item.pinned);
};
