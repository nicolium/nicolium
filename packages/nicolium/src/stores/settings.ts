import isEqual from 'lodash/isEqual';
import { defineMessages } from 'react-intl';
import * as v from 'valibot';
import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

import { settingsSchema, type Settings } from '@/schemas/frontend-settings';
import KVStore from '@/storage/kv-store';
import { getCurrentAccountId } from '@/stores/auth';
import toast from '@/toast';
import {
  type KVStoreRedirectServicesItem,
  resetRules,
  setManualRedirectServices,
  updateRedirectServicesFromUrl,
  updateRulesFromUrl,
} from '@/utils/url-purify';

import type { Emoji } from '@/features/emoji';
import type { APIEntity } from '@/types/entities';

const messages = defineMessages({
  rulesUpdateSuccess: {
    id: 'url_privacy.update.success',
    defaultMessage: 'Successfully updated rules database',
  },
  rulesUpdateFail: {
    id: 'url_privacy.update.fail',
    defaultMessage: 'Failed to update rules database URL',
  },
  redirectServicesUpdateSuccess: {
    id: 'url_privacy.redirect_services_update.success',
    defaultMessage: 'Successfully updated redirect services',
  },
  redirectServicesUpdateFail: {
    id: 'url_privacy.redirect_services_update.fail',
    defaultMessage: 'Failed to update redirect services URL',
  },
});

const settingsSchemaPartial = v.partial(settingsSchema);

const isRecordObject = (value: unknown): value is APIEntity =>
  typeof value === 'object' && !Array.isArray(value) && value !== null;

const pickInputKeys = <T>(parsed: T, input: unknown): Partial<T> => {
  if (!isRecordObject(parsed) || !isRecordObject(input)) return parsed as Partial<T>;

  return Object.fromEntries(
    Object.keys(input)
      .filter((key) => key in parsed)
      .map((key) => {
        const parsedValue = parsed[key];
        const inputValue = input[key];

        if (isRecordObject(parsedValue) && isRecordObject(inputValue)) {
          return [key, pickInputKeys(parsedValue, inputValue)];
        }

        return [key, parsedValue];
      }),
  ) as Partial<T>;
};

const mergeSettingsObject = <T>(defaultSettings: T, userSettings: Partial<T>): T => {
  if (!isRecordObject(defaultSettings) || !isRecordObject(userSettings)) return userSettings as T;

  const userSettingsRecord = userSettings as APIEntity;

  return Object.fromEntries(
    Array.from(new Set([...Object.keys(defaultSettings), ...Object.keys(userSettings)])).map(
      (key) => {
        const defaultValue = defaultSettings[key];
        const userValue = userSettingsRecord[key];

        if (userValue === undefined) return [key, defaultValue];
        if (isRecordObject(defaultValue) && isRecordObject(userValue)) {
          return [key, mergeSettingsObject(defaultValue, userValue)];
        }

        return [key, userValue];
      },
    ),
  ) as T;
};

type State = {
  defaultSettings: Settings;
  userSettings: Partial<Settings>;

  settings: Settings;

  actions: {
    loadDefaultSettings: (settings: unknown) => void;
    loadUserSettings: (settings: unknown) => void;
    userSettingsSaving: () => void;
    changeSetting: (path: string[], value: any) => void;
    rememberEmojiUse: (emoji: Emoji) => void;
    rememberLanguageUse: (language: string) => void;
  };
};

const changeSetting = (object: APIEntity, path: string[], value: any, _root?: Settings) => {
  if (path.length === 1) {
    object[path[0]] = value;
    return;
  }

  if (!isRecordObject(object[path[0]])) {
    object[path[0]] = {};
  }
  changeSetting(object[path[0]], path.slice(1), value);
};

const mergeSettings = (state: State, updating = false) => {
  const mergedSettings = mergeSettingsObject(state.defaultSettings, state.userSettings);
  if (updating) {
    const currentAccountId = getCurrentAccountId();
    if (currentAccountId) {
      if (
        mergedSettings.urlPrivacy.rulesUrl &&
        state.settings.urlPrivacy.rulesUrl !== mergedSettings.urlPrivacy.rulesUrl
      ) {
        updateRulesFromUrl(
          currentAccountId,
          mergedSettings.urlPrivacy.rulesUrl,
          mergedSettings.urlPrivacy.hashUrl,
        )
          .then(() => {
            toast.success(messages.rulesUpdateSuccess);
          })
          .catch(() => {
            toast.error(messages.rulesUpdateFail);
          });
      } else if (
        !mergedSettings.urlPrivacy.rulesUrl &&
        state.settings.urlPrivacy.rulesUrl !== mergedSettings.urlPrivacy.rulesUrl
      ) {
        resetRules(currentAccountId)
          .then(() => {
            toast.success(messages.rulesUpdateSuccess);
          })
          .catch(() => {
            toast.error(messages.rulesUpdateFail);
          });
      }
      if (
        mergedSettings.urlPrivacy.redirectLinksMode === 'auto' &&
        mergedSettings.urlPrivacy.redirectServicesUrl &&
        state.settings.urlPrivacy.redirectServicesUrl !==
          mergedSettings.urlPrivacy.redirectServicesUrl
      ) {
        updateRedirectServicesFromUrl(
          currentAccountId,
          mergedSettings.urlPrivacy.redirectServicesUrl,
        )
          .then(() => {
            toast.success(messages.redirectServicesUpdateSuccess);
          })
          .catch(() => {
            toast.error(messages.redirectServicesUpdateFail);
          });
      } else if (
        mergedSettings.urlPrivacy.redirectLinksMode === 'manual' &&
        !isEqual(
          state.settings.urlPrivacy.redirectServices,
          mergedSettings.urlPrivacy.redirectServices,
        )
      ) {
        setManualRedirectServices(currentAccountId, mergedSettings.urlPrivacy.redirectServices)
          .then(() => {
            toast.success(messages.redirectServicesUpdateSuccess);
          })
          .catch(() => {
            toast.error(messages.redirectServicesUpdateFail);
          });
      } else if (
        mergedSettings.urlPrivacy.redirectLinksMode === 'off' &&
        state.settings.urlPrivacy.redirectLinksMode !== 'off'
      ) {
        setManualRedirectServices(currentAccountId, {});
      }
    }
  }
  state.settings = mergedSettings;
};

const useSettingsStore = create<State>()(
  mutative(
    (set) => ({
      defaultSettings: v.parse(settingsSchema, { locale: navigator.language }),
      userSettings: {},

      settings: v.parse(settingsSchema, { locale: navigator.language }),

      actions: {
        loadDefaultSettings: (settings: unknown) => {
          set((state: State) => {
            if (typeof settings !== 'object') return;

            state.defaultSettings = v.parse(settingsSchema, settings);
            mergeSettings(state);
          });
        },

        loadUserSettings: (settings?: unknown) => {
          set((state: State) => {
            if (typeof settings !== 'object') return;

            state.userSettings = pickInputKeys(v.parse(settingsSchemaPartial, settings), settings);

            const currentAccountId = getCurrentAccountId();
            if (currentAccountId) {
              KVStore.getItem<string>('url-purify-rules:last')
                .then((value) => {
                  if (value !== currentAccountId) {
                    if (state.userSettings.urlPrivacy?.rulesUrl) {
                      updateRulesFromUrl(
                        currentAccountId,
                        state.userSettings.urlPrivacy.rulesUrl,
                        state.userSettings.urlPrivacy.hashUrl,
                      )
                        .then(() => {
                          toast.success(messages.rulesUpdateSuccess);
                        })
                        .catch(() => {
                          toast.error(messages.rulesUpdateFail);
                        });
                    } else {
                      resetRules(currentAccountId);
                    }
                    switch (state.userSettings.urlPrivacy?.redirectLinksMode) {
                      case 'auto':
                        updateRedirectServicesFromUrl(
                          currentAccountId,
                          state.userSettings.urlPrivacy?.redirectServicesUrl,
                        );
                        break;
                      case 'manual':
                        setManualRedirectServices(
                          currentAccountId,
                          state.userSettings.urlPrivacy.redirectServices,
                        );
                        break;
                      default:
                        setManualRedirectServices(currentAccountId, {});
                        break;
                    }
                  } else {
                    KVStore.getItem<KVStoreRedirectServicesItem>(
                      `url-purify-redirect-services:${currentAccountId}`,
                    )
                      .then((services) => {
                        if (state.userSettings.urlPrivacy?.redirectLinksMode === 'auto') {
                          if (
                            services?.redirectServicesUrl !==
                            state.userSettings.urlPrivacy?.redirectServicesUrl
                          ) {
                            updateRedirectServicesFromUrl(
                              currentAccountId,
                              state.userSettings.urlPrivacy?.redirectServicesUrl,
                            );
                          }
                        } else {
                          setManualRedirectServices(
                            currentAccountId,
                            state.userSettings.urlPrivacy?.redirectServices ?? {},
                          );
                        }
                      })
                      .catch(() => {});
                  }
                })
                .catch(() => {});
            }

            mergeSettings(state);
          });
        },

        userSettingsSaving: () => {
          set((state: State) => {
            state.userSettings.saved = true;

            mergeSettings(state);
          });
        },

        changeSetting: (path: string[], value: any) => {
          set((state: State) => {
            state.userSettings.saved = false;
            changeSetting(state.userSettings, path, value);

            mergeSettings(state, true);
          });
        },

        rememberEmojiUse: (emoji: Emoji) => {
          set((state: State) => {
            const settings = state.userSettings;
            settings.frequentlyUsedEmojis ??= {};

            settings.frequentlyUsedEmojis[emoji.id] =
              (settings.frequentlyUsedEmojis[emoji.id] || 0) + 1;
            settings.saved = false;

            mergeSettings(state);
          });
        },

        rememberLanguageUse: (language: string) => {
          set((state: State) => {
            const settings = state.userSettings;
            settings.frequentlyUsedLanguages ??= {};

            settings.frequentlyUsedLanguages[language] =
              (settings.frequentlyUsedLanguages[language] || 0) + 1;
            settings.saved = false;

            mergeSettings(state);
          });
        },
      },
    }),
    { enableAutoFreeze: true },
  ),
);

const useSettings = () => useSettingsStore((state) => state.settings);
const useDefaultSettings = () => useSettingsStore((state) => state.defaultSettings);
const useSettingsStoreActions = () => useSettingsStore((state) => state.actions);

export {
  useSettingsStore,
  useSettings,
  useDefaultSettings,
  useSettingsStoreActions,
  changeSetting as recursiveChangeSetting,
};
