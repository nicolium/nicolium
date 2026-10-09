import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import * as v from 'valibot';
import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';

import { filteredArray } from '@/utils/schemas';

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
  'compose.forceImplicitAddressing': v.fallback(v.boolean(), false),
  'compose.missingDescriptionModal': v.fallback(v.boolean(), true),
  'compose.missingLanguageModal': v.fallback(v.boolean(), false),
  'compose.preserveSpoilers': v.fallback(v.boolean(), true),

  'timelines.autoloadMore': v.fallback(v.boolean(), false),
  'timelines.autoloadTimelines': v.fallback(v.boolean(), false),
  'timelines.missingDescriptionBoostModal': v.fallback(v.boolean(), false),

  'notifications.filters': filteredArray(
    v.picklist(['mention', 'favourite', 'reblog', 'poll', 'status', 'follow', 'events']),
  ),
  'notifications.hideBots': v.optional(v.boolean(), false),
  'notifications.autoMarkRead': v.optional(v.boolean(), false),
});

type Settings = v.InferOutput<typeof settingsSchema>;

const DEFAULT_SETTINGS = v.parse(settingsSchema, {});

const storage = createAsyncStorage('settings');

type State = {
  settings: Settings;
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  reset: () => void;
};

const useSettingsStore = create<State>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      update: (key, value) => set((s) => ({ settings: { ...s.settings, [key]: value } })),
      reset: () => set({ settings: DEFAULT_SETTINGS }),
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

export { useSettingsStore, useSetting };
