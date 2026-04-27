import * as v from 'valibot';

import { locales } from '@/messages';

import { coerceObject, filteredArray } from './utils';

const AVAILABLE_NAVIGATION_ITEMS = [
  'separator',
  'search-input',
  'home',
  'search',
  'notifications',
  'chats',
  'conversations',
  'groups',
  'profile',
  'drive',
  'settings',
  'dashboard',
  'public-timeline',
  'bubble-timeline',
  'fediverse-timeline',
  'wrenched-timeline',
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
  'edit-profile',
  'mutes',
  'blocks',
  'filters',
  'domain-blocks',
  'circle',
  'compose',
] as const;

const DEFAULT_PINNED_NAVIGATION_ITEMS = [
  'home',
  'groups',
  'search',
  'notifications',
  'chats',
  'compose',
] as const;

const DEFAULT_NAVIGATION_ITEMS = [
  'search-input',
  'home',
  'search',
  'notifications',
  'chats',
  'groups',
  'profile',
  'drive',
  'separator',
  'public-timeline',
  'bubble-timeline',
  'fediverse-timeline',
  'wrenched-timeline',
  'separator',
  'settings',
  'dashboard',
  'compose',
] as const;

const AVAILABLE_STATUS_ACTION_BAR_ITEMS = [
  'reply',
  'reblog',
  'quote',
  'favourite',
  'dislike',
  'wrench',
  'reaction',
  'bookmark',
  'share',
  'translate',
] as const;

const DEFAULT_STATUS_ACTION_BAR_ITEMS = [
  'reply',
  'reblog',
  'favourite',
  'dislike',
  'reaction',
] as const;

const AVAILABLE_SIDEBAR_ITEMS = [
  'context',
  'announcements',
  'recommendations',
  'promo',
  'footer',
  'compose',
  'notifications',
] as const;

const DEFAULT_SIDEBAR_ITEMS = [
  'context',
  'announcements',
  'recommendations',
  'promo',
  'footer',
] as const;

const timelineSchema = v.fallback(
  v.pipe(
    v.string(),
    v.transform((timeline) => {
      if (['home', 'local', 'bubble', 'federated', 'wrenched'].includes(timeline)) {
        return timeline;
      }
      if (
        ['list', 'circle', 'antenna', 'instance'].some((prefix) =>
          timeline.startsWith(prefix + ':'),
        )
      ) {
        return timeline;
      }
      return 'home';
    }),
  ),
  'home',
);

const baseDeckColumnSchema = v.object({
  columnWidth: v.fallback(v.picklist(['xs', 'sm', 'md', 'lg', 'xl']), 'md'),
});

const timelineDeckColumnSchema = v.object({
  ...baseDeckColumnSchema.entries,
  type: v.literal('timeline'),
  timeline: timelineSchema,
});

const notificationsColumnSchema = v.object({
  ...baseDeckColumnSchema.entries,
  type: v.literal('notifications'),
  filters: v.fallback(v.array(v.string()), []),
});

const accountColumnSchema = v.object({
  ...baseDeckColumnSchema.entries,
  type: v.literal('account'),
  accountId: v.fallback(v.optional(v.string()), undefined),
});

const searchColumnSchema = v.object({
  ...baseDeckColumnSchema.entries,
  type: v.literal('search'),
  query: v.fallback(v.string(), ''),
  searchType: v.fallback(v.picklist(['accounts', 'statuses', 'hashtags']), 'accounts'),
  accountId: v.fallback(v.optional(v.string()), undefined),
});

const deckColumnSchema = v.variant('type', [
  timelineDeckColumnSchema,
  notificationsColumnSchema,
  accountColumnSchema,
  searchColumnSchema,
]);

const deckSettingsSchema = v.fallback(
  v.object({
    columns: filteredArray(deckColumnSchema),
  }),
  {
    columns: [
      {
        type: 'timeline',
        columnWidth: 'md',
        timeline: 'home',
      },
      {
        type: 'notifications',
        columnWidth: 'md',
        filters: [],
      },
      {
        type: 'account',
        columnWidth: 'md',
        accountId: 'self',
      },
    ],
  },
);

const skinToneSchema = v.picklist([1, 2, 3, 4, 5, 6]);

const settingsSchema = v.object({
  onboarded: v.fallback(v.boolean(), false),
  skinTone: v.fallback(skinToneSchema, 1),
  reduceMotion: v.fallback(v.boolean(), false),
  renderMfm: v.fallback(v.boolean(), true),
  renderAdvancedMfm: v.fallback(v.boolean(), true),
  renderAnimatedMfm: v.fallback(v.boolean(), false),
  underlineLinks: v.fallback(v.boolean(), false),
  autoPlayGif: v.fallback(v.boolean(), true),
  displayMedia: v.fallback(v.picklist(['default', 'hide_all', 'show_all']), 'default'),
  displaySpoilers: v.fallback(v.boolean(), false),
  unfollowModal: v.fallback(v.boolean(), true),
  boostModal: v.fallback(v.boolean(), false),
  deleteModal: v.fallback(v.boolean(), true),
  missingDescriptionModal: v.fallback(v.boolean(), true),
  wrenchModal: v.fallback(v.boolean(), false),
  missingDescriptionBoostModal: v.fallback(v.boolean(), false),
  ignoreHashtagCasingSuggestions: v.fallback(v.boolean(), false),
  defaultPrivacy: v.fallback(v.picklist(['public', 'unlisted', 'private', 'direct']), 'public'),
  defaultContentType: v.fallback(
    v.picklist(['text/plain', 'text/markdown', 'text/html', 'wysiwyg']),
    'text/plain',
  ),
  themeMode: v.fallback(v.picklist(['system', 'light', 'dark', 'black']), 'system'),
  locale: v.fallback(v.pipe(v.fallback(v.string(), navigator.language), v.picklist(locales)), 'en'),
  showExplanationBox: v.fallback(v.boolean(), true),
  explanationBox: v.fallback(v.boolean(), true),
  autoloadTimelines: v.fallback(v.boolean(), true),
  autoloadMore: v.fallback(v.boolean(), true),
  preserveSpoilers: v.fallback(v.boolean(), true),
  forceImplicitAddressing: v.fallback(v.boolean(), false),
  useDedicatedComposePage: v.fallback(v.boolean(), false),
  autoTranslate: v.fallback(v.boolean(), false),
  knownLanguages: v.fallback(v.array(v.string()), []),
  showSideBySideTranslations: v.fallback(v.boolean(), false),
  urlPrivacy: coerceObject({
    clearLinksInCompose: v.optional(v.boolean(), true),
    clearLinksInContent: v.optional(v.boolean(), false),
    allowReferralMarketing: v.optional(v.boolean(), false),
    rulesUrl: v.optional(v.string(), ''),
    hashUrl: v.optional(v.string(), ''),
    displayTargetHost: v.optional(v.boolean(), true),
    redirectLinksMode: v.optional(v.picklist(['off', 'auto', 'manual']), 'off'),
    redirectServicesUrl: v.optional(v.string(), ''),
    redirectServices: v.optional(v.record(v.string(), v.string()), {}),
  }),
  checkEmojiReactsSupport: v.fallback(v.boolean(), false),
  disableUserProvidedMedia: v.fallback(v.boolean(), false),
  stripMetadata: v.fallback(v.boolean(), false),
  storeSettingsInNotes: v.fallback(v.boolean(), false),
  composeInTimelines: v.fallback(v.boolean(), true),
  rememberTimelinePosition: v.fallback(v.boolean(), true),
  accountNicknames: v.fallback(v.record(v.string(), v.string()), {}),
  useSystemMediaControls: v.fallback(v.boolean(), false),
  displayMentionAvatars: v.fallback(v.boolean(), false),
  defaultTimeline: timelineSchema,
  showChatWidget: v.fallback(v.boolean(), true),
  showNestedQuotes: v.fallback(v.boolean(), false),
  useRocketIconForReblogs: v.fallback(v.boolean(), false),

  theme: v.optional(
    coerceObject({
      brandColor: v.optional(v.string()),
      accentColor: v.optional(v.string()),
      colors: v.optional(v.any()),
      interfaceSize: v.fallback(v.picklist(['sm', 'md', 'lg', 'xl']), 'md'),
      systemDarkThemePreference: v.fallback(v.picklist(['dark', 'black']), 'black'),
    }),
    undefined,
  ),

  systemFont: v.fallback(v.boolean(), false),
  systemEmojiFont: v.fallback(v.boolean(), false),
  demetricator: v.fallback(v.boolean(), false),

  chats: coerceObject({
    mainWindow: v.optional(v.picklist(['minimized', 'open']), 'minimized'),
    sound: v.optional(v.boolean(), true),
  }),

  timelines: v.fallback(
    v.record(
      v.picklist([
        'home',
        'antenna',
        'bubble',
        'circle',
        'local',
        'group',
        'hashtag',
        'list',
        'public',
        'wrenched',
      ]),
      coerceObject({
        showReblogs: v.fallback(v.boolean(), true),
        showSelfReblogs: v.fallback(v.boolean(), true),
        showReplies: v.fallback(v.boolean(), true),
        showQuotes: v.fallback(v.boolean(), true),
        showDirect: v.fallback(v.boolean(), true),
        showNonMedia: v.fallback(v.boolean(), true),
        showMediaWithoutAltText: v.fallback(v.boolean(), true),
      }),
    ),
    {},
  ),

  account_timeline: coerceObject({
    shows: coerceObject({
      pinned: v.optional(v.boolean(), true),
    }),
  }),

  remote_timeline: coerceObject({
    pinnedHosts: v.optional(v.array(v.string()), []),
  }),

  threads: coerceObject({
    displayMode: v.optional(v.picklist(['tree', 'tree-indent', 'linear']), 'tree'),
  }),

  notifications: coerceObject({
    quickFilter: coerceObject({
      active: v.optional(
        v.picklist(['all', 'mention', 'favourite', 'reblog', 'poll', 'status', 'follow', 'events']),
        'all',
      ),
      advanced: v.optional(v.boolean(), false),
      show: v.optional(v.boolean(), true),
    }),
    sounds: v.optional(v.record(v.string(), v.boolean()), {}),
  }),

  frequentlyUsedEmojis: v.fallback(v.record(v.string(), v.number()), {}),
  frequentlyUsedLanguages: v.fallback(v.record(v.string(), v.number()), {}),

  saved: v.fallback(v.boolean(), true),

  demo: v.fallback(v.boolean(), false),

  navigationItems: v.fallback(
    v.array(v.picklist(AVAILABLE_NAVIGATION_ITEMS)),
    DEFAULT_NAVIGATION_ITEMS,
  ),
  pinnedNavigationItems: v.fallback(
    v.array(v.picklist(AVAILABLE_NAVIGATION_ITEMS)),
    DEFAULT_PINNED_NAVIGATION_ITEMS,
  ),
  statusActionBarItems: v.fallback(
    v.array(v.picklist(AVAILABLE_STATUS_ACTION_BAR_ITEMS)),
    DEFAULT_STATUS_ACTION_BAR_ITEMS,
  ),
  sidebarItems: v.fallback(v.array(v.picklist(AVAILABLE_SIDEBAR_ITEMS)), DEFAULT_SIDEBAR_ITEMS),

  deck: deckSettingsSchema,
});

type Settings = v.InferOutput<typeof settingsSchema>;
type TimelineFilters = Settings['timelines']['home'];

export {
  settingsSchema,
  type Settings,
  type TimelineFilters,
  AVAILABLE_NAVIGATION_ITEMS,
  AVAILABLE_SIDEBAR_ITEMS,
  AVAILABLE_STATUS_ACTION_BAR_ITEMS,
  DEFAULT_NAVIGATION_ITEMS,
  DEFAULT_PINNED_NAVIGATION_ITEMS,
  DEFAULT_STATUS_ACTION_BAR_ITEMS,
  DEFAULT_SIDEBAR_ITEMS,
};
