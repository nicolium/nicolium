import { defineMessage } from 'react-intl';

import { patchMe } from '@/actions/me';
import { getClient } from '@/api';
import { NODE_ENV } from '@/build-config';
import messages from '@/messages';
import { selectOwnAccount } from '@/queries/accounts/selectors';
import KVStore from '@/storage/kv-store';
import { useSettingsStore } from '@/stores/settings';
import toast from '@/toast';
import { isLoggedIn } from '@/utils/auth';

import type { AppDispatch, RootState } from '@/store';

const LEGACY_FE_NAME = NODE_ENV === 'production' ? 'pl_fe' : 'pl_fe_dev';
const FE_NAME = NODE_ENV === 'production' ? 'nicolium' : 'nicolium_dev';

/** Options when changing/saving settings. */
type SettingOpts = {
  /** Whether to display an alert when settings are saved. */
  showAlert?: boolean;
  save?: boolean;
};

const saveSuccessMessage = defineMessage({
  id: 'settings.save.success',
  defaultMessage: 'Your preferences have been saved!',
});

const changeSetting = (path: string[], value: any, opts?: SettingOpts) => {
  useSettingsStore.getState().actions.changeSetting(path, value);

  if (opts?.save !== false) return saveSettings(opts);
  return () => {};
};

const saveSettings = (opts?: SettingOpts) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  const {
    userSettings,
    actions: { userSettingsSaving },
  } = useSettingsStore.getState();
  if (userSettings.saved) return;

  const { saved, ...data } = userSettings;

  dispatch(updateSettingsStore(data))
    .then(() => {
      userSettingsSaving();

      if (opts?.showAlert) {
        toast.success(saveSuccessMessage);
      }
    })
    .catch((error) => {
      toast.showAlertForError(error);
    });
};

/** Update settings store for Mastodon, etc. */
const updateAuthAccount = async (url: string, settings: any) => {
  const key = `authAccount:${url}`;
  const oldAccount: any = await KVStore.getItem(key);
  try {
    if (!oldAccount) return;
    oldAccount.settings_store ??= {};
    oldAccount.settings_store[FE_NAME] = settings;
    await KVStore.setItem(key, oldAccount);
  } catch (error) {
    console.error(error);
  }
};

const updateSettingsStore =
  (settings: any) => async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const client = getClient(state);

    if (client.features.frontendConfigurations) {
      return dispatch(
        patchMe({
          settings_store: {
            [FE_NAME]: settings,
          },
        }),
      );
    } else {
      if (client.features.notes) {
        // Inspired by Phanpy and designed for compatibility with other software doing this
        // https://github.com/cheeaun/phanpy/commit/a8b5c8cd64d456d30aab09dc56da7e4e20100e67
        const note = (await client.accounts.getRelationships([state.me as string]))[0]?.note;
        const settingsNote = `<nicolium-config>${encodeURIComponent(JSON.stringify(settings))}</nicolium-config>`;

        let newNote;
        if (/<nicolium-config>(.*)<\/nicolium-config>/.test(note || '')) {
          newNote = note!.replace(/<nicolium-config>(.*)<\/nicolium-config>/, settingsNote);
        } else {
          newNote = `${note || ''}\n\n${settingsNote}`;
        }
        client.accounts.updateAccountNote(state.me as string, newNote);
      }

      const accountUrl = selectOwnAccount(state)!.url;

      return updateAuthAccount(accountUrl, settings);
    }
  };

const getLocale = (fallback = 'en') => {
  const localeWithVariant = useSettingsStore.getState().settings.locale.replace('_', '-');
  const locale = localeWithVariant.split('-')[0];
  return Object.keys(messages).includes(localeWithVariant)
    ? localeWithVariant
    : Object.keys(messages).includes(locale)
      ? locale
      : fallback;
};

export { FE_NAME, LEGACY_FE_NAME, changeSetting, saveSettings, updateSettingsStore, getLocale };
