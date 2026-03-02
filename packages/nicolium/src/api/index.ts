/**
 * API: HTTP client and utilities.
 * @module @/api
 */
import * as BuildConfig from '@/build-config';
import { buildFullPath } from '@/utils/url';

import type { RootState, Store } from '@/store';

let store: Store;
import('@/store').then((value) => (store = value.store)).catch(() => {});

type NicoliumResponse<T = any> = Response & { data: string; json: T };

/**
 * Dumb client for grabbing static files.
 * It uses FE_SUBDIRECTORY and parses JSON if possible.
 * No authorization is needed.
 */
const staticFetch = async (input: URL | RequestInfo, init?: RequestInit) => {
  const fullPath = buildFullPath(input.toString(), BuildConfig.BACKEND_URL);

  const response = await fetch(fullPath, init);
  if (!response.ok) throw { response };

  const data = await response.text();

  let json: any = undefined!;
  try {
    json = JSON.parse(data);
  } catch (e) {
    //
  }

  const { headers, ok, redirected, status, statusText, type, url } = response;

  return {
    headers,
    ok,
    redirected,
    status,
    statusText,
    type,
    url,
    data,
    json,
  } as any as NicoliumResponse;
};

const getClient = (state: RootState | (() => RootState) = store?.getState()) => {
  if (typeof state === 'function') state = state();

  return state.auth.client;
};

export { type NicoliumResponse, staticFetch, getClient };
