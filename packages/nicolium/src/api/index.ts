/**
 * API: HTTP client and utilities.
 * @module @/api
 */
import * as BuildConfig from '@/build-config';
import { buildFullPath } from '@/utils/url';

type NicoliumResponse<T = any> = Response & { data: string; json: T };

/**
 * Dumb client for grabbing static files.
 * It uses FE_SUBDIRECTORY and parses JSON if possible.
 * No authorization is needed.
 */
const staticFetch = async (input: URL | RequestInfo, init?: RequestInit, retry?: boolean) => {
  let retried = false;

  const fullPath = buildFullPath(input.toString(), BuildConfig.BACKEND_URL);

  let response = await fetch(fullPath, init).catch((err) => {
    if (retry && BuildConfig.BACKEND_URL) {
      retried = true;
      const fullPath = buildFullPath(input.toString());

      return fetch(fullPath, init);
    } else throw err;
  });

  if (!response.ok && !retried) {
    if (retry && BuildConfig.BACKEND_URL) {
      const fullPath = buildFullPath(input.toString());

      response = await fetch(fullPath, init);
    } else throw { response };
  }

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

export { type NicoliumResponse, staticFetch };
