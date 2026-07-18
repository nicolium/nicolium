import isEqual from 'lodash/isEqual';
import { defineMessages } from 'react-intl';

import { NODE_ENV } from '@/build-config';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { scopedQueryKey } from '@/queries/query';
import KVStore from '@/storage/kv-store';
import { updateMe, getClient, getCurrentAccountId, useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import toast from '@/toast';

import type { NicoliumResponse } from '@/api';
import type { Settings } from '@/schemas/frontend-settings';

const FE_NAME = NODE_ENV === 'production' ? 'nicolium' : 'nicolium_dev';

/** Options when changing/saving settings. */
type SettingOpts = {
  /** Whether to display an alert when settings are saved. */
  showAlert?: boolean;
  save?: boolean;
};

const messages = defineMessages({
  saveSuccess: {
    id: 'settings.save.success',
    defaultMessage: 'Preferences saved',
  },
  noteTooLong: {
    id: 'settings.save.fail.note_too_long',
    defaultMessage:
      'Failed to save settings in note. Note is too long. Disabling "Store settings in account notes" option.',
  },
});

const changeSetting = (
  path: string[],
  value: any | ((previousValue: any) => any),
  opts?: SettingOpts,
) => {
  useSettingsStore.getState().actions.changeSetting(path, value);

  if (opts?.save !== false) return saveSettings(opts, path[0] === 'storeSettingsInNotes');
};

let savePromise: Promise<void> | undefined;
let pendingNotesChange = false;
let showSuccessAlert = false;

const saveSettings = (opts?: SettingOpts, isNotesChange?: boolean) => {
  const currentAccountId = getCurrentAccountId();
  if (typeof currentAccountId !== 'string') return;

  const state = useSettingsStore.getState();
  if (!state.userSettingsLoaded || state.userSettings.saved) return;

  pendingNotesChange ||= !!isNotesChange;
  showSuccessAlert ||= !!opts?.showAlert;

  if (savePromise) return savePromise;

  savePromise = (async () => {
    try {
      while (true) {
        const {
          userSettings,
          actions: { userSettingsSaving },
        } = useSettingsStore.getState();
        const { saved, ...data } = userSettings;
        const notesChange = pendingNotesChange;
        pendingNotesChange = false;

        try {
          await updateSettingsStore(data, notesChange);
        } catch (error) {
          pendingNotesChange ||= notesChange;
          throw error;
        }

        const { saved: _, ...currentData } = useSettingsStore.getState().userSettings;

        if (isEqual(data, currentData)) {
          userSettingsSaving();
          if (showSuccessAlert) toast.success(messages.saveSuccess);
          return;
        }
      }
    } catch (error) {
      toast.showAlertForError(error as { response: NicoliumResponse });
    } finally {
      savePromise = undefined;
      showSuccessAlert = false;
    }
  })();

  return savePromise;
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
  const client = getClient();
  const currentAccountId = getCurrentAccountId();
  // we're not supporting changing settings for non-current user for now
  const scopeUrl = useAuthStore.getState().me;

  if (!scopeUrl) return;

  if (client.features.frontendConfigurations) {
    return updateMe({
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
      client.accounts.updateAccountNote(currentAccountId as string, newNote).catch((error) => {
        if (error.response?.status === 422 && settings.storeSettingsInNotes) {
          toast.info(messages.noteTooLong);

          if (newNote.includes('<nicolium-config>')) {
            changeSetting(['storeSettingsInNotes'], false);
          }
        }
      });
    }

    const accountId = currentAccountId;
    if (typeof accountId !== 'string') return;
    const account = queryClient.getQueryData(
      scopedQueryKey(queryKeys.accounts.show(accountId), scopeUrl),
    );
    if (!account) return;

    return updateAuthAccount(account.url, settings);
  }
};

export { FE_NAME, changeSetting, saveSettings, updateSettingsStore };
