import * as v from 'valibot';

import { locales } from '@/messages';

import { coerceObject } from './utils';

const skinToneSchema = v.picklist([1, 2, 3, 4, 5, 6]);

const settingsSchema = v.object({
  onboarded: v.fallback(v.boolean(), false),
  skinTone: v.fallback(skinToneSchema, 1),
  reduceMotion: v.fallback(v.boolean(), false),
  renderMfm: v.fallback(v.boolean(), false),
  renderAdvancedMfm: v.fallback(v.boolean(), true),
  renderAnimatedMfm: v.fallback(v.boolean(), true),
  underlineLinks: v.fallback(v.boolean(), false),
  autoPlayGif: v.fallback(v.boolean(), true),
  displayMedia: v.fallback(v.picklist(['default', 'hide_all', 'show_all']), 'default'),
  displaySpoilers: v.fallback(v.boolean(), false),
  unfollowModal: v.fallback(v.boolean(), true),
  boostModal: v.fallback(v.boolean(), false),
  deleteModal: v.fallback(v.boolean(), true),
  missingDescriptionModal: v.fallback(v.boolean(), true),
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
  autoTranslate: v.fallback(v.boolean(), false),
  knownLanguages: v.fallback(v.array(v.string()), []),
  showWrenchButton: v.fallback(v.boolean(), false),
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

  theme: v.optional(
    coerceObject({
      brandColor: v.optional(v.string()),
      accentColor: v.optional(v.string()),
      colors: v.optional(v.any()),
      interfaceSize: v.fallback(v.picklist(['sm', 'md', 'lg', 'xl']), 'md'),
      backgroundGradient: v.optional(v.boolean(), true),
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
      v.string(),
      coerceObject({
        shows: coerceObject({
          reblog: v.optional(v.boolean(), true),
          reply: v.optional(v.boolean(), true),
          direct: v.optional(v.boolean(), false),
        }),
        other: coerceObject({
          onlyMedia: v.optional(v.boolean(), false),
        }),
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
    displayMode: v.optional(v.picklist(['tree', 'linear']), 'tree'),
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

  experimentalTimeline: v.fallback(v.boolean(), false),
});

type Settings = v.InferOutput<typeof settingsSchema>;

export { settingsSchema, type Settings };
