import { getLinks } from '@/request';
import { PaginatedResponse } from '@/responses';

import type { accounts } from '../client/accounts';
import type { statuses } from '../client/statuses';
import type { PlApiBaseClient } from '@/client-base';
import type { Account, Status } from '@/entities';

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

export { paginatedIceshrimpAccountsList, paginatedIceshrimpStatusesList };
