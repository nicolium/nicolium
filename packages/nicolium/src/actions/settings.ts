import { defineMessage } from 'react-intl';

import { patchMe } from '@/actions/auth';
import { NODE_ENV } from '@/build-config';
import { selectOwnAccount } from '@/queries/accounts/selectors';
import KVStore from '@/storage/kv-store';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import toast from '@/toast';

import type { Settings } from '@/schemas/frontend-settings';

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

  if (opts?.save !== false) return saveSettings(opts, path[0] === 'storeSettingsInNotes');
};

const saveSettings = (opts?: SettingOpts, isNotesChange?: boolean) => {
  const { currentAccountId } = useAuthStore.getState();
  if (typeof currentAccountId !== 'string') return;

  const {
    userSettings,
    actions: { userSettingsSaving },
  } = useSettingsStore.getState();
  if (userSettings.saved) return;

  const { saved, ...data } = userSettings;

  updateSettingsStore(data, isNotesChange)
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

const updateSettingsStore = async (settings: Partial<Settings>, isNotesChange?: boolean) => {
  const { client, currentAccountId } = useAuthStore.getState();

  if (client.features.frontendConfigurations) {
    return patchMe({
      settings_store: {
        [FE_NAME]: settings,
      },
    });
  } else {
    if (client.features.notes && (settings.storeSettingsInNotes || isNotesChange)) {
      const note = (await client.accounts.getRelationships([currentAccountId as string]))[0]?.note;
      const settingsNote = `<nicolium-config>${encodeURIComponent(JSON.stringify(settings))}</nicolium-config>`;

      let newNote;
      if (settings.storeSettingsInNotes) {
        if (/<nicolium-config>(.*)<\/nicolium-config>/.test(note || '')) {
          newNote = note!.replace(/<nicolium-config>(.*)<\/nicolium-config>/, settingsNote);
        } else {
          newNote = `${note || ''}\n\n${settingsNote}`;
        }
      } else {
        newNote = note ? note.replace(/<nicolium-config>(.*)<\/nicolium-config>/, '') : '';
      }
      client.accounts.updateAccountNote(currentAccountId as string, newNote);
    }

    const account = selectOwnAccount();
    if (!account) return;

    return updateAuthAccount(account.url, settings);
  }
};

export { FE_NAME, LEGACY_FE_NAME, changeSetting, saveSettings, updateSettingsStore };
