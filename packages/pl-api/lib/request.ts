import LinkHeader from 'http-link-header';
import { serialize } from 'object-to-formdata';

import { buildFullPath } from '@/utils/url';

import type { PlApiBaseClient } from '@/client-base';

type Response<T = any> = {
  headers: Headers;
  ok: boolean;
  redirected: boolean;
  status: number;
  statusText: string;
  type: ResponseType;
  url: string;
  data: string;
  json: T;
};

/**
  Parse Link headers, mostly for pagination.
  @param {object} response - Fetch API response object
  @returns {object} Link object
  */
const getLinks = (
  response: Pick<Response, 'headers'>,
): { next: string | null; prev: string | null } => {
  const headers = response.headers?.get('link');
  const linkHeader = (headers && new LinkHeader(headers)) || null;

  return {
    next: linkHeader?.refs.find((link) => link.rel.toLocaleLowerCase() === 'next')?.uri || null,
    prev: linkHeader?.refs.find((link) => link.rel.toLocaleLowerCase() === 'prev')?.uri || null,
  };
};

interface AsyncRefreshHeader {
  id: string;
  retry: number;
}

const isAsyncRefreshHeader = (obj: object): obj is AsyncRefreshHeader =>
  'id' in obj && 'retry' in obj;

const getAsyncRefreshHeader = (response: Pick<Response, 'headers'>): AsyncRefreshHeader | null => {
  const value = response.headers.get('mastodon-async-refresh');

  if (!value) {
    return null;
  }

  const asyncRefreshHeader: Record<string, unknown> = {};

  value.split(/,\s*/).forEach((pair) => {
    const [key, val] = pair.split('=', 2);

    let typedValue: string | number;

    if (key && ['id', 'retry'].includes(key) && val) {
      if (val.startsWith('"')) {
        typedValue = val.slice(1, -1);
      } else {
        typedValue = parseInt(val, 10);
      }

      asyncRefreshHeader[key] = typedValue;
    }
  });

  if (isAsyncRefreshHeader(asyncRefreshHeader)) {
    return asyncRefreshHeader;
  }

  return null;
};

interface RequestBody<Params = Record<string, any>> {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: any;
  params?: Params;
  onUploadProgress?: (e: ProgressEvent) => void;
  signal?: AbortSignal;
  contentType?: string;
  formData?: boolean;
  idempotencyKey?: string;
}

type RequestMeta = Pick<RequestBody, 'idempotencyKey' | 'onUploadProgress' | 'signal'>;

function request<T = any>(
  this: Pick<
    PlApiBaseClient,
    'accessToken' | 'customAuthorizationToken' | 'iceshrimpAccessToken' | 'baseURL'
  >,
  input: URL | RequestInfo,
  {
    body,
    method = body ? 'POST' : 'GET',
    params,
    onUploadProgress,
    signal,
    contentType,
    formData,
    idempotencyKey,
  }: RequestBody = {},
) {
  input = input.toString();
  const fullPath = buildFullPath(input, this.baseURL, params);
  const headers = new Headers();

  if (input.startsWith('/api/iceshrimp/') && this.iceshrimpAccessToken)
    headers.set('Authorization', `Bearer ${this.iceshrimpAccessToken}`);
  else if (this.accessToken) headers.set('Authorization', `Bearer ${this.accessToken}`);
  else if (this.customAuthorizationToken)
    headers.set('Authorization', this.customAuthorizationToken);
  if ((!formData && body) || contentType)
    headers.set('Content-Type', contentType || 'application/json');
  if (idempotencyKey) headers.set('Idempotency-Key', idempotencyKey);

  body = body && formData ? serialize(body, { indices: true }) : JSON.stringify(body);

  // Fetch API doesn't report upload progress, use XHR
  if (onUploadProgress) {
    return new Promise<Response<T>>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', onUploadProgress!);
      xhr.addEventListener('loadend', () => {
        const data = xhr.response;
        let json: T = undefined!;

        if (xhr.getResponseHeader('content-type')?.match(/(text|application)\/json/)) {
          try {
            json = JSON.parse(data);
          } catch (e) {
            //
          }
        }

        if (xhr.status >= 400)
          reject({
            response: {
              status: xhr.status,
              statusText: xhr.statusText,
              url: xhr.responseURL,
              data,
              json,
            },
          });
        else resolve({ status: xhr.status, data, json } as any as Response<T>);
      });

      xhr.open(method, fullPath, true);
      headers.forEach((value, key) => xhr.setRequestHeader(key, value));
      xhr.responseType = 'text';
      xhr.send(body as FormData);
    });
  }

  return fetch(fullPath, {
    method,
    headers,
    body,
    signal,
  }).then(async (res) => {
    const data = await res.text();

    let json: T = undefined!;

    if (res.headers.get('content-type')?.match(/(text|application)\/json/)) {
      try {
        json = JSON.parse(data);
      } catch (e) {
        //
      }
    }

    const { headers, ok, redirected, status, statusText, type, url } = res;

    const response = { headers, ok, redirected, status, statusText, type, url, data, json };

    if (!ok) {
      throw { response };
    }
    return response as any as Response<T>;
  });
}

export {
  type Response,
  type RequestBody,
  type RequestMeta,
  type AsyncRefreshHeader,
  getLinks,
  getAsyncRefreshHeader,
  request as default,
};
