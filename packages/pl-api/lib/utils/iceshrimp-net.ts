import * as v from 'valibot';

import { tokenSchema } from '@/entities';
import { getLinks } from '@/request';
import { PaginatedResponse } from '@/responses';

import type { accounts } from '../client/accounts';
import type { statuses } from '../client/statuses';
import type { PlApiBaseClient } from '@/client-base';
import type { Account, Status } from '@/entities';

interface IceshrimpAuthResponse {
  token: string;
  status: 'guest' | 'authenticated' | 'two_factor';
}

interface IceshrimpSessionResponse {
  id: string;
  token: string;
  created_at: string;
  scopes: Array<string>;
}

const authorizeIceshrimp = async (
  client: PlApiBaseClient,
  url: string,
  body: Record<string, any>,
): Promise<IceshrimpAuthResponse> => {
  const response = await client.request<IceshrimpAuthResponse>(url, { method: 'POST', body });

  client.setIceshrimpAccessToken(response.json.token);

  return response.json;
};

const createIceshrimpMastodonSession = async (
  client: PlApiBaseClient,
  { appName, scopes }: { appName?: string; scopes?: string },
) => {
  const response = await client.request<IceshrimpSessionResponse>(
    '/api/iceshrimp/sessions/mastodon',
    {
      method: 'POST',
      body: {
        appName,
        scopes: scopes?.split(' '),
        flags: {
          supportsHtmlFormatting: true,
          autoDetectQuotes: false,
          isPleroma: true,
          supportsInlineMedia: true,
        },
      },
    },
  );

  return v.parse(tokenSchema, {
    access_token: response.json.token,
    token_type: 'Bearer',
    scope: response.json.scopes.join(' '),
    created_at: new Date(response.json.created_at).getTime(),
    id: response.json.id,
  });
};

const paginatedIceshrimpAccountsList = async <T>(
  client: PlApiBaseClient & { accounts: ReturnType<typeof accounts> },
  url: string,
  params: Record<string, any> | undefined = undefined,
  fn: (body: T) => Array<string>,
): Promise<PaginatedResponse<Account>> => {
  await client.getIceshrimpAccessToken();

  const response = await client.request<T>(url, params ? { params } : undefined);
  const ids = fn(response.json);

  const items = await client.accounts.getAccounts(ids);

  const { prev: prevLink, next: nextLink } = getLinks(response);

  return new PaginatedResponse(items, {
    previous: prevLink
      ? () => paginatedIceshrimpAccountsList(client, prevLink, undefined, fn)
      : null,
    next: nextLink ? () => paginatedIceshrimpAccountsList(client, nextLink, undefined, fn) : null,
    partial: response.status === 206,
  });
};

const paginatedIceshrimpStatusesList = async <T>(
  client: PlApiBaseClient & { statuses: ReturnType<typeof statuses> },
  url: string,
  params: Record<string, any> | undefined = undefined,
  fn: (body: T) => Array<string>,
): Promise<PaginatedResponse<Status>> => {
  await client.getIceshrimpAccessToken();

  const response = await client.request<T>(url, params ? { params } : undefined);
  const ids = fn(response.json);

  const items = (await client.statuses.getStatuses(ids)).toReversed();

  const { prev: prevLink, next: nextLink } = getLinks(response);

  return new PaginatedResponse(items, {
    previous: prevLink
      ? () => paginatedIceshrimpStatusesList(client, prevLink, undefined, fn)
      : null,
    next: nextLink ? () => paginatedIceshrimpStatusesList(client, nextLink, undefined, fn) : null,
    partial: response.status === 206,
  });
};

export {
  authorizeIceshrimp,
  createIceshrimpMastodonSession,
  paginatedIceshrimpAccountsList,
  paginatedIceshrimpStatusesList,
};
