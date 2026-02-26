import * as v from 'valibot';

import { accountSchema, antennaSchema } from '../entities';
import { filteredArray } from '../entities/utils';

import type { PlApiBaseClient } from '../client-base';
import type { CreateAntennaParams, UpdateAntennaParams } from '../params/antennas';

type EmptyObject = Record<string, never>;

const antennas = (client: PlApiBaseClient) => ({
  /**
   * Requires features{@link Features.antennas}.
   */
  fetchAntennas: async () => {
    const response = await client.request('/api/v1/antennas');

    return v.parse(filteredArray(antennaSchema), response.json);
  },

  /**
   * Requires features{@link Features.antennas}.
   */
  getAntennas: async (antennaId: string) => {
    const response = await client.request(`/api/v1/antennas/${antennaId}`);

    return v.parse(antennaSchema, response.json);
  },

  /**
   * Requires features{@link Features.antennas}.
   */
  createAntenna: async (params: CreateAntennaParams) => {
    const response = await client.request('/api/v1/antennas', { method: 'POST', body: params });

    return v.parse(antennaSchema, response.json);
  },

  /**
   * Requires features{@link Features.antennas}.
   */
  updateAntenna: async (antennaId: string, params: UpdateAntennaParams) => {
    const response = await client.request(`/api/v1/antennas/${antennaId}`, {
      method: 'PUT',
      body: params,
    });

    return v.parse(antennaSchema, response.json);
  },

  /**
   * Requires features{@link Features.antennas}.
   */
  deleteAntenna: async (antennaId: string) => {
    const response = await client.request<EmptyObject>(`/api/v1/antennas/${antennaId}`, {
      method: 'DELETE',
    });

    return response.json;
  },

  /**
   * Requires features{@link Features.antennas}.
   */
  getAntennaAccounts: (antennaId: string) =>
    client.paginatedGet(`/api/v1/antennas/${antennaId}/accounts`, {}, accountSchema),

  /**
   * Requires features{@link Features.antennas}.
   */
  addAntennaAccounts: async (antennaId: string, accountIds: Array<string>) => {
    const response = await client.request<EmptyObject>(`/api/v1/antennas/${antennaId}/accounts`, {
      method: 'POST',
      body: { account_ids: accountIds },
    });

    return response.json;
  },

  /**
   * Requires features{@link Features.antennas}.
   */
  removeAntennaAccounts: async (antennaId: string, accountIds: Array<string>) => {
    const response = await client.request<EmptyObject>(`/api/v1/antennas/${antennaId}/accounts`, {
      method: 'DELETE',
      body: { account_ids: accountIds },
    });

    return response.json;
  },

  /**
   * Requires features{@link Features.antennas}.
   */
  getAntennaExcludedAccounts: (antennaId: string) =>
    client.paginatedGet(`/api/v1/antennas/${antennaId}/exclude_accounts`, {}, accountSchema),

  /**
   * Requires features{@link Features.antennas}.
   */
  addAntennaExcludedAccounts: async (antennaId: string, accountIds: Array<string>) => {
    const response = await client.request<EmptyObject>(
      `/api/v1/antennas/${antennaId}/exclude_accounts`,
      {
        method: 'POST',
        body: { account_ids: accountIds },
      },
    );

    return response.json;
  },

  /**
   * Requires features{@link Features.antennas}.
   */
  removeAntennaExcludedAccounts: async (antennaId: string, accountIds: Array<string>) => {
    const response = await client.request<EmptyObject>(
      `/api/v1/antennas/${antennaId}/exclude_accounts`,
      {
        method: 'DELETE',
        body: { account_ids: accountIds },
      },
    );

    return response.json;
  },

  /**
   * Requires features{@link Features.antennas}.
   */
  getAntennaDomains: async (antennaId: string) => {
    const response = await client.request(`/api/v1/antennas/${antennaId}/domains`);

    return v.parse(
      v.object({
        domains: filteredArray(v.string()),
        exclude_domains: filteredArray(v.string()),
      }),
      response.json,
    );
  },

  /**
   * Requires features{@link Features.antennas}.
   */
  addAntennaDomains: async (antennaId: string, domains: Array<string>) => {
    const response = await client.request<EmptyObject>(`/api/v1/antennas/${antennaId}/domains`, {
      method: 'POST',
      body: { domains },
    });

    return response.json;
  },

  /**
   * Requires features{@link Features.antennas}.
   */
  removeAntennaDomains: async (antennaId: string, domains: Array<string>) => {
    const response = await client.request<EmptyObject>(`/api/v1/antennas/${antennaId}/domains`, {
      method: 'DELETE',
      body: { domains },
    });

    return response.json;
  },

  /**
   * Requires features{@link Features.antennas}.
   */
  addAntennaExcludedDomains: async (antennaId: string, domains: Array<string>) => {
    const response = await client.request<EmptyObject>(
      `/api/v1/antennas/${antennaId}/exclude_domains`,
      {
        method: 'POST',
        body: { domains },
      },
    );

    return response.json;
  },

  /**
   * Requires features{@link Features.antennas}.
   */
  removeAntennaExcludedDomains: async (antennaId: string, domains: Array<string>) => {
    const response = await client.request<EmptyObject>(
      `/api/v1/antennas/${antennaId}/exclude_domains`,
      {
        method: 'DELETE',
        body: { domains },
      },
    );

    return response.json;
  },

  /**
   * Requires features{@link Features.antennas}.
   */
  getAntennaKeywords: async (antennaId: string) => {
    const response = await client.request(`/api/v1/antennas/${antennaId}/keywords`);

    return v.parse(
      v.object({
        keywords: filteredArray(v.string()),
        exclude_keywords: filteredArray(v.string()),
      }),
      response.json,
    );
  },

  /**
   * Requires features{@link Features.antennas}.
   */
  addAntennaKeywords: async (antennaId: string, keywords: Array<string>) => {
    const response = await client.request<EmptyObject>(`/api/v1/antennas/${antennaId}/keywords`, {
      method: 'POST',
      body: { keywords },
    });

    return response.json;
  },

  /**
   * Requires features{@link Features.antennas}.
   */
  removeAntennaKeywords: async (antennaId: string, keywords: Array<string>) => {
    const response = await client.request<EmptyObject>(`/api/v1/antennas/${antennaId}/keywords`, {
      method: 'DELETE',
      body: { keywords },
    });

    return response.json;
  },

  /**
   * Requires features{@link Features.antennas}.
   */
  addAntennaExcludedKeywords: async (antennaId: string, keywords: Array<string>) => {
    const response = await client.request<EmptyObject>(
      `/api/v1/antennas/${antennaId}/exclude_keywords`,
      {
        method: 'POST',
        body: { keywords },
      },
    );

    return response.json;
  },

  /**
   * Requires features{@link Features.antennas}.
   */
  removeAntennaExcludedKeywords: async (antennaId: string, keywords: Array<string>) => {
    const response = await client.request<EmptyObject>(
      `/api/v1/antennas/${antennaId}/exclude_keywords`,
      {
        method: 'DELETE',
        body: { keywords },
      },
    );

    return response.json;
  },

  /**
   * Requires features{@link Features.antennas}.
   */
  getAntennaTags: async (antennaId: string) => {
    const response = await client.request(`/api/v1/antennas/${antennaId}/tags`);

    return v.parse(
      v.object({
        tags: filteredArray(v.string()),
        exclude_tags: filteredArray(v.string()),
      }),
      response.json,
    );
  },

  /**
   * Requires features{@link Features.antennas}.
   */
  addAntennaTags: async (antennaId: string, tags: Array<string>) => {
    const response = await client.request<EmptyObject>(`/api/v1/antennas/${antennaId}/tags`, {
      method: 'POST',
      body: { tags },
    });

    return response.json;
  },

  /**
   * Requires features{@link Features.antennas}.
   */
  removeAntennaTags: async (antennaId: string, tags: Array<string>) => {
    const response = await client.request<EmptyObject>(`/api/v1/antennas/${antennaId}/tags`, {
      method: 'DELETE',
      body: { tags },
    });

    return response.json;
  },

  /**
   * Requires features{@link Features.antennas}.
   */
  addAntennaExcludedTags: async (antennaId: string, tags: Array<string>) => {
    const response = await client.request<EmptyObject>(
      `/api/v1/antennas/${antennaId}/exclude_tags`,
      {
        method: 'POST',
        body: { tags },
      },
    );

    return response.json;
  },

  /**
   * Requires features{@link Features.antennas}.
   */
  removeAntennaExcludedTags: async (antennaId: string, tags: Array<string>) => {
    const response = await client.request<EmptyObject>(
      `/api/v1/antennas/${antennaId}/exclude_tags`,
      {
        method: 'DELETE',
        body: { tags },
      },
    );

    return response.json;
  },
});

export { antennas };
