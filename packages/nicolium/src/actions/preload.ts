import mapValues from 'lodash/mapValues';
import { accountSchema } from 'pl-api';
import * as v from 'valibot';

import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { useAuthStore } from '@/stores/auth';
import { useFrontendConfigStore } from '@/stores/frontend-config';
import { useInstanceStore } from '@/stores/instance';

import { verifyCredentials } from './auth';

// https://git.pleroma.social/pleroma/pleroma-fe/-/merge_requests/1176/diffs
const decodeUTF8Base64 = (data: string) => {
  const rawData = atob(data);
  const array = Uint8Array.from(rawData.split('').map((char) => char.charCodeAt(0)));
  const text = new TextDecoder().decode(array);
  return text;
};

const decodePleromaData = (data: Record<string, any>) =>
  mapValues(data, (base64string) => JSON.parse(decodeUTF8Base64(base64string)));

const pleromaDecoder = (json: string) => decodePleromaData(JSON.parse(json));

// This will throw if it fails.
// Should be called inside a try-catch.
const decodeFromMarkup = (elementId: string, decoder: (json: string) => Record<string, any>) => {
  const { textContent } = document.getElementById(elementId)!;
  return decoder(textContent as string);
};

const preloadFromMarkup = (
  elementId: string,
  decoder: (json: string) => Record<string, any>,
  action: (data: Record<string, any>) => void,
) => {
  try {
    const data = decodeFromMarkup(elementId, decoder);
    action(data);
  } catch {
    // Do nothing
  }
};

const preloadPleroma = (data: Record<string, any>) => {
  useInstanceStore.getState().actions.importPreload(data);
  useFrontendConfigStore.getState().actions.importPreload(data);
};

const preloadMastodon = (data: Record<string, any>) => {
  const { me, access_token } = data.meta;
  const { url } = data.accounts[me];

  for (const account of Object.values(data.accounts)) {
    try {
      const parsedAccount = v.parse(accountSchema, account);
      queryClient.setQueryData(queryKeys.accounts.show(parsedAccount.id), parsedAccount);
    } catch {
      //
    }
  }

  useAuthStore.getState().actions.importMastodonPreload(data);
  verifyCredentials(access_token, url);
};

const preload = () => {
  preloadFromMarkup('initial-results', pleromaDecoder, preloadPleroma);

  try {
    const data = decodeFromMarkup('initial-state', JSON.parse);
    preloadMastodon(data);
  } catch {
    // Do nothing
  }
};

export { preload };
