import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import { filterSchema } from 'pl-api';
import * as v from 'valibot';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { coerceObject, filteredArray, filteredRecord } from '@/utils/schemas';

const TIMELINE_FILTER_KEYS = [
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
] as const;

const timelineFiltersSchema = coerceObject({
  showReblogs: v.fallback(v.boolean(), true),
  showSelfReblogs: v.fallback(v.boolean(), true),
  showReplies: v.fallback(v.boolean(), true),
  showQuotes: v.fallback(v.boolean(), true),
  showDirect: v.fallback(v.boolean(), true),
  showNonMedia: v.fallback(v.boolean(), true),
  showMediaWithoutAltText: v.fallback(v.boolean(), true),
});

type TimelineFilters = v.InferOutput<typeof timelineFiltersSchema>;

const settingsSchema = v.object({
  'compose.autosaveDrafts': v.optional(v.boolean(), false),
  'compose.defaultPrivacy': v.fallback(
    v.picklist(['public', 'unlisted', 'private', 'direct']),
    'public',
  ),
  'compose.defaultContentType': v.fallback(
    v.picklist(['text/plain', 'text/markdown', 'text/html']),
    'text/plain',
  ),
  'compose.defaultLanguage': v.fallback(v.string(), 'detect'),
  'compose.forceImplicitAddressing': v.fallback(v.boolean(), false),
  'compose.missingDescriptionModal': v.fallback(v.boolean(), true),
  'compose.missingLanguageModal': v.fallback(v.boolean(), false),
  'compose.preserveSpoilers': v.fallback(v.boolean(), true),
  'compose.stripMetadata': v.fallback(v.boolean(), false),

  'timelines.autoloadMore': v.fallback(v.boolean(), false),
  'timelines.autoloadTimelines': v.fallback(v.boolean(), false),
  'timelines.boostModal': v.fallback(v.boolean(), false),
  'timelines.missingDescriptionBoostModal': v.fallback(v.boolean(), false),
  'timelines.skipInteractAsConfirmation': v.fallback(v.boolean(), false),
  'timelines.filters': filteredRecord(v.picklist(TIMELINE_FILTER_KEYS), timelineFiltersSchema),

  'notifications.filters': filteredArray(
    v.picklist(['mention', 'favourite', 'reblog', 'poll', 'status', 'follow', 'events']),
  ),
  'notifications.hideBots': v.optional(v.boolean(), false),
  'notifications.autoMarkRead': v.optional(v.boolean(), false),

  'appearance.enableLiquidGlass': v.optional(v.boolean(), true),

  filters: filteredArray(filterSchema),
});

type Settings = v.InferOutput<typeof settingsSchema>;

const DEFAULT_SETTINGS = v.parse(settingsSchema, {});

const storage = createAsyncStorage('settings');

type State = {
  settings: Settings;
  actions: {
    update: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
    reset: () => void;
  };
};

const useSettingsStore = create<State>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      actions: {
        update: (key, value) => set((s) => ({ settings: { ...s.settings, [key]: value } })),
        reset: () => set({ settings: DEFAULT_SETTINGS }),
      },
    }),
    {
      name: 'settings',
      version: 1,
      storage: createJSONStorage(() => storage),
      partialize: (s) => ({ settings: s.settings }),
      merge: (persisted: any, current) => ({
        ...current,
        settings: v.parse(settingsSchema, persisted?.settings ?? {}),
      }),
    },
  ),
);

const useSetting = <K extends keyof Settings>(key: K) => useSettingsStore((s) => s.settings[key]);

const useSettingsActions = () => useSettingsStore(({ actions }) => actions);

export {
  TIMELINE_FILTER_KEYS,
  useSettingsStore,
  useSetting,
  useSettingsActions,
  type TimelineFilters,
};
