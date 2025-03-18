import { defineMessages } from 'react-intl';
import * as v from 'valibot';
import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

import { settingsSchema, type Settings } from 'pl-fe/schemas/pl-fe/settings';
import toast from 'pl-fe/toast';
import { updateRulesFromUrl } from 'pl-fe/utils/url-purify';

import type { Emoji } from 'pl-fe/features/emoji';
import type { store } from 'pl-fe/store';
import type { APIEntity } from 'pl-fe/types/entities';

let lazyStore: typeof store;
import('pl-fe/store').then(({ store }) => lazyStore = store).catch(() => {});

const messages = defineMessages({
  updateSuccess: { id: 'url_privacy.update.success', defaultMessage: 'Successfully updated rules database' },
  updateFail: { id: 'url_privacy.update.fail', defaultMessage: 'Failed to update rules database URL' },
});

const settingsSchemaPartial = v.partial(settingsSchema);

type State = {
  defaultSettings: Settings;
  userSettings: Partial<Settings>;

  settings: Settings;

  loadDefaultSettings: (settings: APIEntity) => void;
  loadUserSettings: (settings: APIEntity) => void;
  userSettingsSaving: () => void;
  changeSetting: (path: string[], value: any) => void;
  rememberEmojiUse: (emoji: Emoji) => void;
  rememberLanguageUse: (language: string) => void;
}

const changeSetting = (object: APIEntity, path: string[], value: any, root?: Settings) => {
  if (path.length === 1) {
    object[path[0]] = value;
    return;
  }

  if (typeof object[path[0]] !== 'object') {
    const value = root && root[path[0] as keyof Settings] as APIEntity || {};
    object[path[0]] = value;
  }
  return changeSetting(object[path[0]], path.slice(1), value);
};

const mergeSettings = (state: State, updating = false) => {
  const mergedSettings = { ...state.defaultSettings, ...state.userSettings };
  if (updating && mergedSettings.urlPrivacy.rulesUrl && state.settings.urlPrivacy.rulesUrl !== mergedSettings.urlPrivacy.rulesUrl) {
    const me = lazyStore?.getState().me;
    if (me) {
      updateRulesFromUrl(me, mergedSettings.urlPrivacy.rulesUrl, mergedSettings.urlPrivacy.hashUrl).then(() => {
        toast.success(messages.updateSuccess);
      }).catch(() => {
        toast.error(messages.updateFail);
      });
    }
  }
  state.settings = mergedSettings;
};

const useSettingsStore = create<State>()(mutative((set) => ({
  defaultSettings: v.parse(settingsSchema, {}),
  userSettings: {},

  settings: v.parse(settingsSchema, {}),

  loadDefaultSettings: (settings: APIEntity) => set((state: State) => {
    if (typeof settings !== 'object') return;

    state.defaultSettings = v.parse(settingsSchema, settings);
    mergeSettings(state);
  }),

  loadUserSettings: (settings?: APIEntity) => set((state: State) => {
    if (typeof settings !== 'object') return;

    state.userSettings = v.parse(settingsSchemaPartial, settings);
    mergeSettings(state);
  }),

  userSettingsSaving: () => set((state: State) => {
    state.userSettings.saved = true;

    mergeSettings(state);
  }),

  changeSetting: (path: string[], value: any) => set((state: State) => {
    state.userSettings.saved = false;
    changeSetting(state.userSettings, path, value, state.defaultSettings);

    mergeSettings(state, true);
  }),

  rememberEmojiUse: (emoji: Emoji) => set((state: State) => {
    const settings = state.userSettings;
    if (!settings.frequentlyUsedEmojis) settings.frequentlyUsedEmojis = {};

    settings.frequentlyUsedEmojis[emoji.id] = (settings.frequentlyUsedEmojis[emoji.id] || 0) + 1;
    settings.saved = false;

    mergeSettings(state);
  }),

  rememberLanguageUse: (language: string) => set((state: State) => {
    const settings = state.userSettings;
    if (!settings.frequentlyUsedLanguages) settings.frequentlyUsedLanguages = {};

    settings.frequentlyUsedLanguages[language] = (settings.frequentlyUsedLanguages[language] || 0) + 1;
    settings.saved = false;

    mergeSettings(state);
  }),
}), { enableAutoFreeze: true }));

export { useSettingsStore };
