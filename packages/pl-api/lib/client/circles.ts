import * as v from 'valibot';

import { accountSchema, circleSchema, statusSchema } from '../entities';
import { filteredArray } from '../entities/utils';

import type { PlApiBaseClient } from '../client-base';
import type { GetCircleAccountsParams, GetCircleStatusesParams } from '../params/circles';

type EmptyObject = Record<string, never>;

const circles = (client: PlApiBaseClient) => ({
  /**
   * Requires features{@link Features.circles}.
   */
  fetchCircles: async () => {
    const response = await client.request('/api/v1/circles');

    return v.parse(filteredArray(circleSchema), response.json);
  },

  /**
   * Requires features{@link Features.circles}.
   */
  getCircle: async (circleId: string) => {
    const response = await client.request(`/api/v1/circles/${circleId}`);

    return v.parse(circleSchema, response.json);
  },

  /**
   * Requires features{@link Features.circles}.
   */
  createCircle: async (title: string) => {
    const response = await client.request('/api/v1/circles', { method: 'POST', body: { title } });

    return v.parse(circleSchema, response.json);
  },

  /**
   * Requires features{@link Features.circles}.
   */
  updateCircle: async (circleId: string, title: string) => {
    const response = await client.request(`/api/v1/circles/${circleId}`, {
      method: 'PUT',
      body: { title },
    });

    return v.parse(circleSchema, response.json);
  },

  /**
   * Requires features{@link Features.circles}.
   */
  deleteCircle: async (circleId: string) => {
    const response = await client.request<EmptyObject>(`/api/v1/circles/${circleId}`, {
      method: 'DELETE',
    });

    return response.json;
  },

  /**
   * View accounts in a circle
   * Requires features{@link Features.circles}.
   */
  getCircleAccounts: (circleId: string, params?: GetCircleAccountsParams) =>
    client.paginatedGet(`/api/v1/circles/${circleId}/accounts`, { params }, accountSchema),

  /**
   * Add accounts to a circle
   * Add accounts to the given circle. Note that the user must be following these accounts.
   * Requires features{@link Features.circles}.
   */
  addCircleAccounts: async (circleId: string, accountIds: string[]) => {
    const response = await client.request<EmptyObject>(`/api/v1/circles/${circleId}/accounts`, {
      method: 'POST',
      body: { account_ids: accountIds },
    });

    return response.json;
  },

  /**
   * Remove accounts from circle
   * Remove accounts from the given circle.
   * Requires features{@link Features.circles}.
   */
  deleteCircleAccounts: async (circleId: string, accountIds: string[]) => {
    const response = await client.request<EmptyObject>(`/api/v1/circles/${circleId}/accounts`, {
      method: 'DELETE',
      body: { account_ids: accountIds },
    });

    return response.json;
  },

  getCircleStatuses: (circleId: string, params: GetCircleStatusesParams) =>
    client.paginatedGet(`/api/v1/circles/${circleId}/statuses`, { params }, statusSchema),
});

export { circles };
